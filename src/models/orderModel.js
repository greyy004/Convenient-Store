import pool from '../config/db.js';

export const createOrderTable = async () => {
    try {
        // Create Orders Table
        const orderQuery = `
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
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

export const createOrder = async (user_id, total_price) => {
    const result = await pool.query(
        `INSERT INTO orders (user_id, total_price)
         VALUES ($1, $2)
         RETURNING id, total_price, status, created_at`,
        [user_id, total_price]
    );
    return result.rows[0];
};

export const addOrderItem = async (order_id, product_id, quantity, price) => {
    await pool.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
         VALUES ($1, $2, $3, $4)`,
        [order_id, product_id, quantity, price]
    );
};

export const getOrdersByUserId = async (user_id) => {
    const result = await pool.query(
        `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
        [user_id]
    );
    return result.rows;
};

export const getOrderItems = async (order_id) => {
    const result = await pool.query(
        `SELECT oi.*, p.product_name 
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = $1`,
        [order_id]
    );
    return result.rows;
};