import path from 'path';
import { fileURLToPath } from 'url';
import { getAllProducts } from '../models/productModel.js';
import { addItemToCart, getCartItems } from '../models/cartModel.js';
import { placeOrder } from '../models/orderModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getUserDash = (req, res) => {
    res.sendFile(
        path.join(__dirname, '../../public/html/userDashboard.html')
    );
};

export const getCheckout = (req, res) => {
    res.sendFile(
        path.join(__dirname, '../../public/html/checkout.html')
    );
};


export const getAllProductsByUser = async (req, res) => {
    try {
        const products = await getAllProducts();
        return res.status(200).json({
            products
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'error getting the products' });
    }
};


export const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user.id;

        if (!productId || !quantity) {
            return res.status(400).json({ message: 'Product ID and quantity are required' });
        }

        await addItemToCart(userId, productId, quantity);

        return res.status(200).json({ message: 'Item added to cart successfully' });
    } catch (err) {
        console.error('Error in addToCart controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const cartItems = await getCartItems(userId);
        return res.status(200).json({ cartItems });
    } catch (err) {
        console.error('Error in getCart controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const placeOrderController = async (req, res) => {
    try {
        const userId = req.user.id;
        const orderData = req.body;

        // Get current cart items to save in order_items
        const cartItems = await getCartItems(userId);
        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const result = await placeOrder(userId, orderData, cartItems);

        return res.status(200).json({ 
            message: 'Order placed successfully', 
            orderId: result.orderId 
        });
    } catch (err) {
        console.error('Error in placeOrder controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};