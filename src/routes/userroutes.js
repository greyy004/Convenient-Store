import express from 'express';
import { getUserDash, getAllProductsByUser } from '../controllers/UserController.js';
import { requireAuth, validateProduct} from '../middlewares/middleware.js';
import { addToCart} from '../controllers/UserController.js';
const router = express.Router();
router.get('/dashboard', getUserDash);
router.get('/products', getAllProductsByUser);
router.post('/addToCart', requireAuth, validateProduct, addToCart);
export default router;
