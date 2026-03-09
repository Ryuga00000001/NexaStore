import express from 'express';
import { getOrderInvoice, getMyOrders, createOrder } from '../controllers/orderController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(protect, getMyOrders).post(protect, createOrder);
router.route('/:id/invoice').get(protect, getOrderInvoice);

export default router;
