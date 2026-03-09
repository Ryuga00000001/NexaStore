"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const redis_1 = require("./config/redis");
const socket_1 = require("./config/socket");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const recommendationRoutes_1 = __importDefault(require("./routes/recommendationRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
// Load environment variables
dotenv_1.default.config();
// Initialize express app and auth socket
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
(0, socket_1.initSocket)(httpServer);
// Stripe Webhook needs raw body, must come before express.json()
app.use('/api/payments/webhook', express_1.default.raw({ type: 'application/json' }));
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/products', productRoutes_1.default);
app.use('/api/recommendations', recommendationRoutes_1.default);
app.use('/api/payments', paymentRoutes_1.default);
app.use('/api/uploads', uploadRoutes_1.default);
app.use('/api/orders', orderRoutes_1.default);
// Make uploads folder static
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Connect to Databases
(0, db_1.default)();
(0, redis_1.connectRedis)();
// Basic Route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'NexaStore backend is running!' });
});
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
