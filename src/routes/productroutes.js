import express from 'express';
import multer from 'multer';
import path from 'path';
const router = express.Router();
import {addProduct, createCategory, getCategories} from '../controllers/productController.js';

// Setup multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

//Add Product
router.post('/addProduct', upload.single('product_img_url'), addProduct);
router.get('/categories', getCategories);
router.post('/categories', createCategory);

export default router;
