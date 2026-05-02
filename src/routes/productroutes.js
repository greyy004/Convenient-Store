import express from 'express';
const router = express.Router();
import {addProduct, createCategory, getCategories} from '../controllers/productController.js';

//Add Product
router.post('/addProduct', addProduct);
router.get('/categories', getCategories);
router.post('/categories', createCategory);

export default router;




