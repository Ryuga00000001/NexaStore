import { Request, Response } from 'express';
import Stripe from 'stripe';
import Order from '../models/Order';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/authMiddleware';
import { getIO } from '../config/socket';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2026-02-25.clover',
});

// @desc    Create a Stripe Checkout session
// @route   POST /api/payments/create-checkout-session
// @access  Private/Customer
export const createCheckoutSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || items.length === 0) {
       res.status(400).json({ message: 'No items in cart' });
       return;
    }

    // Prepare line items for Stripe
    const lineItems = [];
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
         res.status(404).json({ message: `Product ${item.product} not found` });
         return;
      }
      
      // Basic checkout race-condition protection (check stock)
      if (product.stock < item.quantity) {
        res.status(400).json({ message: `Insufficient stock for ${product.name}` });
        return;
      }

      const amount = product.price * 100; // Stripe expects cents
      totalAmount += amount * item.quantity;

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            images: product.imageUrl ? [product.imageUrl] : [],
          },
          unit_amount: amount,
        },
        quantity: item.quantity,
      });

      validatedItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price, // Storing original price per product in order
      });
    }

    // Create an order in 'pending' status
    const order = await Order.create({
      customer: req.user?._id,
      items: validatedItems,
      totalAmount: totalAmount / 100, // store in dollars
      shippingAddress,
      paymentStatus: 'pending'
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/cart`,
      metadata: {
        orderId: order.id,
      },
    });

    // Update order with payment intent/session ID
    order.paymentIntentId = session.id;
    await order.save();

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe Error:', error);
    res.status(500).json({ message: 'Server Error creating checkout session' });
  }
};

// @desc    Stripe Webhook Endpoint
// @route   POST /api/payments/webhook
// @access  Public (Secured by Stripe Signature)
export const handleStripeWebhook = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'] as string;
  let event;

  try {
    // Note: This requires express.raw({ type: 'application/json' }) middleware specifically for this route in server.ts
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_mock'
    );
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle successful checkout
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Fulfill the purchase
    const orderId = session.metadata?.orderId;
    if (orderId) {
      try {
        const order = await Order.findById(orderId);
        if (order && order.paymentStatus === 'pending') {
          order.paymentStatus = 'completed';
          await order.save();

          // Deduct inventory and emit socket event
          for (const item of order.items) {
             const updatedProduct = await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stock: -item.quantity } },
                { new: true }
             );

             // Broadcast the new inventory level to all clients observing the product
             if (updatedProduct) {
                 getIO().emit('inventory-updated', {
                    productId: updatedProduct._id,
                    newStock: updatedProduct.stock
                 });
             }
          }
        }
      } catch (err) {
        console.error('Error fulfilling order:', err);
      }
    }
  }

  res.status(200).send('Received');
};
