import pool from '../config/db.js';

export const createOrderTable = async () => {
    try {
        // Create Orders Table
        const orderQuery = `
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                full_name VARCHAR(100),
                address TEXT,
                city VARCHAR(100),
                phone VARCHAR(20),
                payment_method VARCHAR(50),
                total_price DECIMAL(10, 2) NOT NULL,
                status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await pool.query(orderQuery);

        // Create Order Items Table
        const orderItemsQuery = `
            CREATE TABLE IF NOT EXISTS order_items (
                id SERIAL PRIMARY KEY,
                order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
                product_id INTEGER REFERENCES products(id),
                quantity INTEGER NOT NULL,
                price_at_purchase DECIMAL(10, 2) NOT NULL
            )
        `;
        await pool.query(orderItemsQuery);
    } catch (err) {
        console.error('Error creating order tables:', err);
    }
};

export const placeOrder = async (userId, orderData, cartItems) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { fullName, address, city, phone, paymentMethod } = orderData;
        
        // Calculate total price
        const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // 1. Insert into orders
        const orderResult = await client.query(
            `INSERT INTO orders (user_id, full_name, address, city, phone, payment_method, total_price)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id`,
            [userId, fullName, address, city, phone, paymentMethod, totalPrice]
        );
        const orderId = orderResult.rows[0].id;

        // 2. Insert into order_items and update stock
        for (const item of cartItems) {
            // Insert order item
            await client.query(
                `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
                 VALUES ($1, $2, $3, $4)`,
                [orderId, item.product_id, item.quantity, item.price]
            );

            // Update product stock
            await client.query(
                `UPDATE products SET stock = stock - $1 WHERE id = $2`,
                [item.quantity, item.product_id]
            );
        }

        // 3. Clear user's cart items
        await client.query(
            `DELETE FROM cart_items 
             WHERE cart_id = (SELECT id FROM carts WHERE user_id = $1)`,
            [userId]
        );

        await client.query('COMMIT');
        return { orderId, totalPrice };
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error in placeOrder model:', err);
        throw err;
    } finally {
        client.release();
    }
};
