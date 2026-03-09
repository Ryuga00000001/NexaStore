import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Support mock tokens for the demo
      if (token === 'mock_admin_token' || token === 'mock_token_for_demo') {
        let adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) {
          adminUser = await User.create({
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

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string, role: string };

      const user = await User.findById(decoded.id).select('-passwordHash');
      if (!user) {
         res.status(401).json({ message: 'Not authorized, user not found' });
         return;
      }
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
      return;
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
    return;
  }
};

export const admin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

export const vendor = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user && (req.user.role === 'vendor' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a vendor' });
  }
};
