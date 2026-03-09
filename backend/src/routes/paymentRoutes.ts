import express from 'express';
import { createCheckoutSession, handleStripeWebhook } from '../controllers/paymentController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/create-checkout-session', protect, createCheckoutSession);

// The webhook route must NOT use express.json() parser, but the global raw parser configured in server.ts
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;
