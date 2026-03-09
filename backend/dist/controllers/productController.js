"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
const Product_1 = __importDefault(require("../models/Product"));
const Vendor_1 = __importDefault(require("../models/Vendor"));
const redis_1 = __importDefault(require("../config/redis"));
const CACHE_KEY = 'products_all';
// @desc    Fetch all products with Redis Caching
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        // Check Redis cache first
        const cachedProducts = await redis_1.default.get(CACHE_KEY);
        if (cachedProducts) {
            res.json(JSON.parse(cachedProducts));
            return;
        }
        // Cache miss, fetch from DB
        const products = await Product_1.default.find({}).populate('vendor', 'storeName');
        // Store in Redis with expiration of 1 hour (3600 seconds)
        await redis_1.default.setEx(CACHE_KEY, 3600, JSON.stringify(products));
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getProducts = getProducts;
// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await Product_1.default.findById(req.params.id).populate('vendor', 'storeName');
        if (product) {
            res.json(product);
        }
        else {
            res.status(404).json({ message: 'Product not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getProductById = getProductById;
// @desc    Create a product
// @route   POST /api/products
// @access  Private/Vendor or Admin
const createProduct = async (req, res) => {
    try {
        // Find vendor for the current user
        const vendor = await Vendor_1.default.findOne({ user: req.user?._id });
        // To simplify for this demo, if vendor doesn't exist, allow admin or auto-create mock vendor profile
        if (!vendor && req.user?.role !== 'admin') {
            res.status(403).json({ message: 'Vendor profile required to create products' });
            return;
        }
        const { name, description, price, stock, category, imageUrl } = req.body;
        const product = new Product_1.default({
            vendor: vendor?._id || req.user?._id, // fallback for admin
            name,
            description,
            price,
            stock,
            category,
            imageUrl,
        });
        const createdProduct = await product.save();
        // Invalidate Cache
        await redis_1.default.del(CACHE_KEY);
        res.status(201).json(createdProduct);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.createProduct = createProduct;
// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Vendor or Admin
const updateProduct = async (req, res) => {
    try {
        const { name, description, price, stock, category, imageUrl } = req.body;
        const product = await Product_1.default.findById(req.params.id);
        if (product) {
            // Check if user is the vendor or admin
            const vendor = await Vendor_1.default.findOne({ user: req.user?._id });
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
            // Invalidate Cache
            await redis_1.default.del(CACHE_KEY);
            res.json(updatedProduct);
        }
        else {
            res.status(404).json({ message: 'Product not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.updateProduct = updateProduct;
// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Vendor or Admin
const deleteProduct = async (req, res) => {
    try {
        const product = await Product_1.default.findById(req.params.id);
        if (product) {
            const vendor = await Vendor_1.default.findOne({ user: req.user?._id });
            if (req.user?.role !== 'admin' && product.vendor.toString() !== vendor?._id.toString()) {
                res.status(403).json({ message: 'Not authorized to delete this product' });
                return;
            }
            await Product_1.default.findByIdAndDelete(req.params.id);
            // Invalidate Cache
            await redis_1.default.del(CACHE_KEY);
            res.json({ message: 'Product removed' });
        }
        else {
            res.status(404).json({ message: 'Product not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.deleteProduct = deleteProduct;
