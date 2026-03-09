import express from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController';
import { protect, vendor, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, vendor, createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, vendor, updateProduct)
  .delete(protect, vendor, deleteProduct);

export default router;
