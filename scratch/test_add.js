import pool from '../src/config/db.js';
import { addItemToCart } from '../src/models/cartModel.js';

async function testAddToCart() {
    try {
        console.log('Testing addItemToCart for user 2, product 1, quantity 5');
        const result = await addItemToCart(2, 1, 5);
        console.log('Result:', result);

        const cartItems = await pool.query('SELECT * FROM cart_items WHERE cart_id = 1 AND product_id = 1');
        console.log('New quantity for product 1:', cartItems.rows[0].quantity);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testAddToCart();
