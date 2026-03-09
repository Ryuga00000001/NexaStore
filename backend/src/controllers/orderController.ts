import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import Order from '../models/Order';
import { AuthRequest } from '../middleware/authMiddleware';

export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({ customer: req.user?._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
};

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { items, shippingAddress, phone } = req.body;
    let totalAmount = 0;
    
    // Calculate total amount from items (assuming frontend sends correct prices for demo)
    for (const item of items) {
       totalAmount += item.price * item.quantity;
    }

    const order = await Order.create({
      customer: req.user?._id,
      items,
      totalAmount,
      shippingAddress,
      phone,
      paymentStatus: 'completed' // Direct order creation for demo
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating order' });
  }
};

export const getOrderInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('items.product', 'name price');

    if (!order) {
       res.status(404).json({ message: 'Order not found' });
       return;
    }

    // Check if user is admin or the order belongs to them
    if (order.customer._id.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
       res.status(403).json({ message: 'Not authorized to view this invoice' });
       return;
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order._id}.pdf`);

    doc.pipe(res);

    // Header
    doc
      .fontSize(20)
      .text('NexaStore Invoice', { align: 'center' })
      .moveDown();

    doc
      .fontSize(12)
      .text(`Order ID: ${order._id}`)
      .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`)
      .text(`Payment Status: ${order.paymentStatus}`)
      .moveDown();

    // Customer Info
    const customerObj = order.customer as any;
    doc
      .text(`Customer: ${customerObj.name || 'Unknown'}`)
      .text(`Email: ${customerObj.email || 'Unknown'}`)
      .text(`Phone: ${order.phone || 'N/A'}`)
      .text(`Address: ${order.shippingAddress || 'N/A'}`)
      .moveDown();

    // Items Header
    doc
      .font('Helvetica-Bold')
      .text('Product', 50, doc.y)
      .text('Quantity', 250, doc.y)
      .text('Price', 350, doc.y)
      .text('Total', 450, doc.y)
      .moveDown();
    
    doc.font('Helvetica');
    
    // Items
    let yPos = doc.y;
    order.items.forEach((item: any) => {
      const product = item.product || { name: 'Unknown Product', price: item.price };
      const itemTotal = item.quantity * (product.price || item.price);

      doc
        .text(product.name, 50, yPos)
        .text(item.quantity.toString(), 250, yPos)
        .text(`$${product.price.toFixed(2)}`, 350, yPos)
        .text(`$${itemTotal.toFixed(2)}`, 450, yPos);
      
      yPos += 20;
    });

    // Total
    doc
      .moveDown(2)
      .font('Helvetica-Bold')
      .text(`Total Amount: $${order.totalAmount.toFixed(2)}`, { align: 'right' });

    doc.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error generating invoice' });
  }
};
