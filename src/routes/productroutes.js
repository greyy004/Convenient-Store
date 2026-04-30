import express from 'express';
const router = express.Router();
import {addProduct} from '../controllers/productController.js';

//Add Product
router.post('/addProduct', addProduct);

export default router;




