import express from 'express';
import { requireAuth, validateShippingData } from '../middlewares/middleware.js';
import { esewaPaymentController, esewaSuccessController, esewaFailureController } from '../controllers/paymentController.js';
const router = express.Router();

router.post('/payment/esewa', requireAuth, validateShippingData, esewaPaymentController);
router.get('/payment/success', esewaSuccessController);
router.get('/payment/failure', esewaFailureController);

export default router;
