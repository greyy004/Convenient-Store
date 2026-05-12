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

export const addItemToCart = async (userId, productId, quantity = 1) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Get or create cart for user
        let cartResult = await client.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
        let cartId;

        if (cartResult.rows.length === 0) {
            const newCart = await client.query(
                'INSERT INTO carts (user_id) VALUES ($1) RETURNING id',
                [userId]
            );
            cartId = newCart.rows[0].id;
        } else {
            cartId = cartResult.rows[0].id;
        }

        // 2. Add or update cart item
        const upsertQuery = `
            INSERT INTO cart_items (cart_id, product_id, quantity)
            VALUES ($1, $2, $3)
            ON CONFLICT (cart_id, product_id)
            DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
            RETURNING *
        `;
        const result = await client.query(upsertQuery, [cartId, productId, quantity]);

        await client.query('COMMIT');
        return result.rows[0];
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error in addItemToCart:', err);
        throw err;
    } finally {
        client.release();
    }
};

export const getCartItemsByUser = async (userId) => {
    const query = `
        SELECT 
            p.id AS product_id,
            p.product_name,
            p.price,
            p.product_img_url,
            ci.quantity
        FROM carts c
        JOIN cart_items ci ON c.id = ci.cart_id
        JOIN products p ON ci.product_id = p.id
        WHERE c.user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
};

export const clearCart = async (userId) => {
    const query = `
        DELETE FROM cart_items 
        WHERE cart_id = (SELECT id FROM carts WHERE user_id = $1)
    `;
    await pool.query(query, [userId]);
};

export const getCartId = async (userId) => {
    try {
        const result = await pool.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
        if (result.rows.length === 0) {
            return null; // No cart found for the user
        }
        return result.rows[0].id;
    } catch (err) {
        console.error('Error in getCartId:', err);
        throw err;
    }
};

export const getCartItems = async (cartId) => {
    try {
    const result = await pool.query(
        `SELECT ci.id, ci.product_id, ci.quantity, p.product_name, p.price
         FROM cart_items ci
         JOIN products p ON ci.product_id = p.id
         WHERE ci.cart_id = $1`,
        [cartId]
    );
    return result.rows;
    } catch (err) {
        console.error('Error in getCartItems:', err);
        throw err;
    }
};