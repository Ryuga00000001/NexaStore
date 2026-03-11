import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

client.on('error', (err) => console.error('Redis Client Error', err));

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
