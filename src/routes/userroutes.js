import express from 'express';
import { getUserDash, getAllProductsByUser, addToCart, getCart, getCheckout, placeOrderController, getUserProfile, getOrderPage, getUserOrdersController } from '../controllers/UserController.js';
import { validateProduct } from '../middlewares/middleware.js';

const router = express.Router();

router.get('/dashboard', getUserDash);
router.get('/products', getAllProductsByUser);
router.post('/addToCart', validateProduct, addToCart);
router.get('/cart', getCart);
router.get('/profile', getUserProfile);
router.get('/checkout', getCheckout);
router.get('/orderList', getOrderPage);
router.get('/orders', getUserOrdersController);
router.post('/placeOrder', placeOrderController);

export default router;
