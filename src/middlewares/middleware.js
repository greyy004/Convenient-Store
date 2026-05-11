import jwt from 'jsonwebtoken';
import { getUserByEmail } from '../models/userModel.js';
import { productDetails } from '../models/productModel.js';

export const maxAge = 3 * 24 * 60 * 60; // 3 days

export const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: maxAge
    });
};

// Registration validation
export const validateRegister = async (req, res, next) => {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
        return res.status(400).json({ message: "All fields are required" });
    }

    if (name.trim().length < 3) {
        return res.status(400).json({ message: "Name must be at least 3 characters long" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Please provide a valid email address" });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
        return res.status(409).json({ message: "This email is already registered" });
    }

    next();
};

// Login validation
export const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Please provide both email and password" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Please provide a valid email address" });
    }

    next();
};

// JWT protection
export const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ message: "Invalid token" });
    }
};

// Admin guard
export const requireAdmin = (req, res, next) => {
    if (!req.user.is_admin) {
        return res.status(403).json({ message: "Admin only" });
    }
    next();
};

export const validateProduct = async (req, res, next) => {
    const { productId } = req.body;
    try {
        if (!productId) {
            return res.status(400).json({ message: "Product ID is required" });
        }

        const parseId = Number(productId);
        if (isNaN(parseId) || !Number.isInteger(parseId) || parseId <= 0) {
            return res.status(400).json({ message: "Invalid product ID format" });
        }

        const productResult = await productDetails(productId);
        if (!productResult) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (productResult.stock <= 0) {
            return res.status(400).json({ message: "Item is out of stock" });
        }

        next();
    }
    catch (err) {
        console.error("Error in validateProduct middleware:", err);
        return res.status(500).json({ message: "Internal server error during validation" });
    }
};