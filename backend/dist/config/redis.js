"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = void 0;
const redis_1 = require("redis");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const client = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
});
client.on('error', (err) => console.error('Redis Client Error', err));
const connectRedis = async () => {
    if (!client.isOpen) {
        await client.connect();
        console.log('Redis Connected');
    }
};
exports.connectRedis = connectRedis;
exports.default = client;
