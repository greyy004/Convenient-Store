import express from 'express';
import { requireAuth, userOnly, validateShippingData } from '../middlewares/middleware.js';
import { esewaPaymentController, esewaSuccessController, esewaFailureController } from '../controllers/paymentController.js';
import { getFeaturedProducts } from '../models/productModel.js';
const router = express.Router();

router.get('/featured-products', async (req, res) => {
    try {
        const products = await getFeaturedProducts(3);
        return res.status(200).json({ products });
    } catch (err) {
        console.error('Error fetching featured products:', err);
        return res.status(500).json({ message: 'Failed to fetch featured products' });
    }
});

router.post('/payment/esewa', requireAuth, userOnly, validateShippingData, esewaPaymentController);
router.get('/payment/success', esewaSuccessController);
router.get('/payment/failure', esewaFailureController);

export default router;
