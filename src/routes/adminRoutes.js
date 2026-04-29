import express from 'express';
import { requireAdmin, requireAuth } from '../middlewares/middleware.js';
import {getAdminDash,getUserCount, getProductCount, getUsers, getProducts, getUsersPage, getProductsPage } from '../controllers/adminController.js';
const router = express.Router();

router.get('/dashboard', requireAuth, requireAdmin, getAdminDash);
router.get('/users-page', requireAuth, requireAdmin, getUsersPage);
router.get('/products-page', requireAuth, requireAdmin, getProductsPage);
router.get('/users/count',requireAuth, requireAdmin, getUserCount);
router.get('/products/count',requireAuth, requireAdmin, getProductCount);
router.get('/users', requireAuth, requireAdmin, getUsers);
router.get('/products', requireAuth, requireAdmin, getProducts);

export default router;
