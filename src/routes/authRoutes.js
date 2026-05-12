import express from 'express';
import {
    validateRegister,
    validateLogin
} from '../middlewares/middleware.js';
import {
    register,
    login,
    logout
} from '../controllers/AuthController.js';

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/logout', logout);

export default router;
