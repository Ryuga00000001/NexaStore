import { Request, Response } from 'express';
import Product from '../models/Product';
import Vendor from '../models/Vendor';
import redisClient from '../config/redis';
import { AuthRequest } from '../middleware/authMiddleware';

const CACHE_KEY = 'products_all';

// @desc    Fetch all products with Redis Caching
// @route   GET /api/products
// @access  Public
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check Redis cache first (Gracefully handle if redis is down)
    let cachedProducts = null;
    try {
       cachedProducts = await redisClient.get(CACHE_KEY);
    } catch(e) { console.warn('Redis read failed'); }
    
    if (cachedProducts) {
      res.json(JSON.parse(cachedProducts));
      return;
    }

    // Cache miss, fetch from DB
    const products = await Product.find({}).populate('vendor', 'storeName');
    
    // Store in Redis (Gracefully handle)
    try {
      await redisClient.setEx(CACHE_KEY, 3600, JSON.stringify(products));
    } catch(e) { console.warn('Redis write failed'); }

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id).populate('vendor', 'storeName');

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Vendor or Admin
export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Find vendor for the current user
    let vendor = await Vendor.findOne({ user: req.user?._id });
    
    // Create mock vendor on the fly if admin
    if (!vendor && req.user?.role === 'admin') {
       vendor = await Vendor.create({
         user: req.user._id,
         storeName: 'Nexa Official Op-' + Math.floor(Math.random() * 999),
         isStripeConnected: true
       });
    } else if (!vendor && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Vendor profile required to create products' });
      return;
    }

    const { name, description, price, stock, category, imageUrl } = req.body;

    const product = new Product({
      vendor: vendor?._id,
      name,
      description,
      price,
      stock,
      category,
      imageUrl,
    });

    const createdProduct = await product.save();

    // Invalidate Cache gracefully
    try { await redisClient.del(CACHE_KEY); } catch(e) { console.warn('Redis invalidate failed'); }

    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Vendor or Admin
export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, price, stock, category, imageUrl } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      // Check if user is the vendor or admin
      const vendor = await Vendor.findOne({ user: req.user?._id });
      
      if (req.user?.role !== 'admin' && product.vendor.toString() !== vendor?._id.toString()) {
         res.status(403).json({ message: 'Not authorized to update this product' });
         return;
      }

      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price || product.price;
      product.category = category || product.category;
      product.stock = stock !== undefined ? stock : product.stock;
      product.imageUrl = imageUrl || product.imageUrl;

      const updatedProduct = await product.save();
      
      // Invalidate Cache gracefully
      try { await redisClient.del(CACHE_KEY); } catch(e) { console.warn('Redis invalidate failed'); }

      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Vendor or Admin
export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      const vendor = await Vendor.findOne({ user: req.user?._id });
      
      if (req.user?.role !== 'admin' && product.vendor.toString() !== vendor?._id.toString()) {
         res.status(403).json({ message: 'Not authorized to delete this product' });
         return;
      }

      await Product.findByIdAndDelete(req.params.id);

      // Invalidate Cache gracefully
      try { await redisClient.del(CACHE_KEY); } catch(e) { console.warn('Redis invalidate failed'); }

      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
