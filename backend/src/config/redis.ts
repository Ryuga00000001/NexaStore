import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: false // Disable reconnection attempts immediately if it fails to connect
  }
});

// Suppress unhandled promise rejections originating from redis client errors.
client.on('error', (err) => {
  if (err.code !== 'ECONNREFUSED') {
    console.error('Redis Client Error', err)
  }
});

export const connectRedis = async () => {
  if (!client.isOpen) {
    try {
      await client.connect();
      console.log('Redis Connected');
    } catch (error) {
      console.log('Redis Connection Optional - Proceeding Without Cache');
    }
  }
};

export default client;
