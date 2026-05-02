import pool from '../config/db.js';

export const createCartTable = async () => {
    try {
        // Create Carts Table
        const cartQuery = `
            CREATE TABLE IF NOT EXISTS carts (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await pool.query(cartQuery);

        // Create Cart Items Table
        const cartItemsQuery = `
            CREATE TABLE IF NOT EXISTS cart_items (
                id SERIAL PRIMARY KEY,
                cart_id INTEGER REFERENCES carts(id) ON DELETE CASCADE,
                product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
                quantity INTEGER DEFAULT 1,
                UNIQUE(cart_id, product_id)
            )
        `;
        await pool.query(cartItemsQuery);
    } catch (err) {
        console.error('Error creating cart tables:', err);
    }
};
