"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vendor = exports.admin = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            // Support mock tokens for the demo
            if (token === 'mock_admin_token' || token === 'mock_token_for_demo') {
                let adminUser = await User_1.default.findOne({ role: 'admin' });
                if (!adminUser) {
                    adminUser = await User_1.default.create({
                        name: 'Demo Admin',
                        email: 'demo_admin@nexastore.com',
                        passwordHash: 'mock_hash',
                        role: 'admin'
                    });
                }
                req.user = adminUser;
                next();
                return;
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
            const user = await User_1.default.findById(decoded.id).select('-passwordHash');
            if (!user) {
                res.status(401).json({ message: 'Not authorized, user not found' });
                return;
            }
            req.user = user;
            next();
        }
        catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
            return;
        }
    }
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
        return;
    }
};
exports.protect = protect;
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    }
    else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};
exports.admin = admin;
const vendor = (req, res, next) => {
    if (req.user && (req.user.role === 'vendor' || req.user.role === 'admin')) {
        next();
    }
    else {
        res.status(403).json({ message: 'Not authorized as a vendor' });
    }
};
exports.vendor = vendor;
