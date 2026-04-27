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

export const getOrCreateCart = async (user_id) => {
    // Try to get existing cart
    let result = await pool.query('SELECT id FROM carts WHERE user_id = $1', [user_id]);
    
    if (result.rows.length === 0) {
        // Create new cart if none exists
        result = await pool.query(
            'INSERT INTO carts (user_id) VALUES ($1) RETURNING id',
            [user_id]
        );
    }
    
    return result.rows[0].id;
};

export const addItemToCart = async (cart_id, product_id, quantity) => {
    const query = `
        INSERT INTO cart_items (cart_id, product_id, quantity)
        VALUES ($1, $2, $3)
        ON CONFLICT (cart_id, product_id)
        DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
    `;
    await pool.query(query, [cart_id, product_id, quantity]);
};

export const getCartItems = async (cart_id) => {
    const query = `
        SELECT ci.*, p.product_name, p.price, p.stock
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.cart_id = $1
    `;
    const result = await pool.query(query, [cart_id]);
    return result.rows;
};

export const updateCartItemQuantity = async (cart_id, product_id, quantity) => {
    await pool.query(
        'UPDATE cart_items SET quantity = $1 WHERE cart_id = $2 AND product_id = $3',
        [quantity, cart_id, product_id]
    );
};

export const removeItemFromCart = async (cart_id, product_id) => {
    await pool.query(
        'DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2',
        [cart_id, product_id]
    );
};

export const clearCart = async (cart_id) => {
    await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [cart_id]);
};
