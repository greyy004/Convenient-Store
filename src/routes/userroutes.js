import express from 'express';
import { getUserDash } from '../controllers/UserController.js';
import {  getProductCount, getAllProductsByUser} from '../controllers/UserController.js';
const router = express.Router();
router.get('/dashboard', getUserDash);
router.get('/productCount', getProductCount);
router.get('/products', getAllProductsByUser);
export default router;