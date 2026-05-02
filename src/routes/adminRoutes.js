import express from 'express';
import {getAdminDash,getUserCount, getProductCount, getUsers, getProducts, getUsersPage, getProductsPage, getSalesData} from '../controllers/adminController.js';

const router = express.Router();

router.get('/dashboard', getAdminDash);
router.get('/users-page', getUsersPage);
router.get('/products-page', getProductsPage);
router.get('/users/count', getUserCount);
router.get('/products/count', getProductCount);
router.get('/users', getUsers);
router.get('/products', getProducts);
router.get('/sales/data', getSalesData);

export default router;
