"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStripeWebhook = exports.createCheckoutSession = void 0;
const stripe_1 = __importDefault(require("stripe"));
const Order_1 = __importDefault(require("../models/Order"));
const Product_1 = __importDefault(require("../models/Product"));
const socket_1 = require("../config/socket");
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
    apiVersion: '2026-02-25.clover',
});
// @desc    Create a Stripe Checkout session
// @route   POST /api/payments/create-checkout-session
// @access  Private/Customer
const createCheckoutSession = async (req, res) => {
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
            const product = await Product_1.default.findById(item.product);
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
        const order = await Order_1.default.create({
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
    }
    catch (error) {
        console.error('Stripe Error:', error);
        res.status(500).json({ message: 'Server Error creating checkout session' });
    }
};
exports.createCheckoutSession = createCheckoutSession;
// @desc    Stripe Webhook Endpoint
// @route   POST /api/payments/webhook
// @access  Public (Secured by Stripe Signature)
const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        // Note: This requires express.raw({ type: 'application/json' }) middleware specifically for this route in server.ts
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || 'whsec_mock');
    }
    catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    // Handle successful checkout
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        // Fulfill the purchase
        const orderId = session.metadata?.orderId;
        if (orderId) {
            try {
                const order = await Order_1.default.findById(orderId);
                if (order && order.paymentStatus === 'pending') {
                    order.paymentStatus = 'completed';
                    await order.save();
                    // Deduct inventory and emit socket event
                    for (const item of order.items) {
                        const updatedProduct = await Product_1.default.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } }, { new: true });
                        // Broadcast the new inventory level to all clients observing the product
                        if (updatedProduct) {
                            (0, socket_1.getIO)().emit('inventory-updated', {
                                productId: updatedProduct._id,
                                newStock: updatedProduct.stock
                            });
                        }
                    }
                }
            }
            catch (err) {
                console.error('Error fulfilling order:', err);
            }
        }
    }
    res.status(200).send('Received');
};
exports.handleStripeWebhook = handleStripeWebhook;
