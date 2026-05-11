import express from 'express';
import { getUserDash, getAllProductsByUser, addToCart, getCart, getCheckout, placeOrderController } from '../controllers/UserController.js';
import { requireAuth, validateProduct } from '../middlewares/middleware.js';

const router = express.Router();

router.get('/dashboard', requireAuth, getUserDash);
router.get('/products', requireAuth, getAllProductsByUser);
router.post('/addToCart', requireAuth, validateProduct, addToCart);
router.get('/cart', requireAuth, getCart);
router.get('/checkout', requireAuth, getCheckout);
router.post('/placeOrder', requireAuth, placeOrderController);

export default router;
