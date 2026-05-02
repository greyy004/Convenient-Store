import express from 'express';
import { getUserDash, getAllProductsByUser } from '../controllers/UserController.js';
const router = express.Router();
router.get('/dashboard', getUserDash);
router.get('/products', getAllProductsByUser);
export default router;
