"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const paymentController_1 = require("../controllers/paymentController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.post('/create-checkout-session', authMiddleware_1.protect, paymentController_1.createCheckoutSession);
// The webhook route must NOT use express.json() parser, but the global raw parser configured in server.ts
router.post('/webhook', express_1.default.raw({ type: 'application/json' }), paymentController_1.handleStripeWebhook);
exports.default = router;
