"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderInvoice = exports.getMyOrders = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const Order_1 = __importDefault(require("../models/Order"));
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order_1.default.find({ customer: req.user?._id }).sort({ createdAt: -1 });
        res.json(orders);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching orders' });
    }
};
exports.getMyOrders = getMyOrders;
const getOrderInvoice = async (req, res) => {
    try {
        const order = await Order_1.default.findById(req.params.id)
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
        const doc = new pdfkit_1.default({ margin: 50 });
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
        const customerObj = order.customer;
        doc
            .text(`Customer: ${customerObj.name || 'Unknown'}`)
            .text(`Email: ${customerObj.email || 'Unknown'}`)
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
        order.items.forEach((item) => {
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error generating invoice' });
    }
};
exports.getOrderInvoice = getOrderInvoice;
