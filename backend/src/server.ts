import express, { Application, Request, Response } from 'express';
import { createServer } from 'http';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/db';
import { connectRedis } from './config/redis';
import { initSocket } from './config/socket';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import recommendationRoutes from './routes/recommendationRoutes';
import paymentRoutes from './routes/paymentRoutes';
import uploadRoutes from './routes/uploadRoutes';
import orderRoutes from './routes/orderRoutes';

// Load environment variables
dotenv.config();

// Initialize express app and auth socket
const app: Application = express();
const httpServer = createServer(app);
initSocket(httpServer);

// Stripe Webhook needs raw body, must come before express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/orders', orderRoutes);

// Make uploads folder static
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Connect to Databases
connectDB();
connectRedis();

// Basic Route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'NexaStore backend is running!' });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
