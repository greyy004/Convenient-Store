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
                country VARCHAR(100) DEFAULT 'Nepal',
                phone VARCHAR(20),
                payment_method VARCHAR(50),
                total_price DECIMAL(10, 2) NOT NULL,
                status VARCHAR(20) DEFAULT 'pending',
                transaction_uuid VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await pool.query(orderQuery);

        await pool.query(`
            ALTER TABLE orders
            ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'Nepal',
            ADD COLUMN IF NOT EXISTS transaction_uuid VARCHAR(100)
        `);

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

        const { fullName, address, country, phone, paymentMethod, transaction_uuid } = orderData;
        
        // Calculate total price
        const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
        const shippingFee = 100;
        const totalPrice = subtotal + shippingFee;

        // 1. Insert into orders
        const orderResult = await client.query(
            `INSERT INTO orders (user_id, full_name, address, country, phone, payment_method, total_price, transaction_uuid)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id`,
            [userId, fullName, address, country, phone, paymentMethod, totalPrice, transaction_uuid || null]
        );
        const orderId = orderResult.rows[0].id;

        // 2. Insert into order_items and update stock
        for (const item of cartItems) {
            // Check stock first
            const stockCheck = await client.query('SELECT stock, product_name FROM products WHERE id = $1', [item.product_id]);

            if (stockCheck.rows.length === 0) {
                throw new Error('Product not found');
            }

            const currentStock = Number(stockCheck.rows[0].stock);
            const itemQuantity = Number(item.quantity);

            if (currentStock < itemQuantity) {
                throw new Error(`Insufficient stock for ${stockCheck.rows[0].product_name}`);
            }

            // Insert order item
            await client.query(
                `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
                 VALUES ($1, $2, $3, $4)`,
                [orderId, item.product_id, itemQuantity, item.price]
            );

            // Update product stock
            await client.query(
                `UPDATE products SET stock = stock - $1 WHERE id = $2`,
                [itemQuantity, item.product_id]
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

export const createPendingOrder = async (userId, orderData, cartItems) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { fullName, address, country, phone, paymentMethod, transaction_uuid } = orderData;
        const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
        const shippingFee = 100;
        const totalPrice = subtotal + shippingFee;

        const orderResult = await client.query(
            `INSERT INTO orders (user_id, full_name, address, country, phone, payment_method, total_price, transaction_uuid, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
             RETURNING id`,
            [userId, fullName, address, country, phone, paymentMethod, totalPrice, transaction_uuid]
        );
        const orderId = orderResult.rows[0].id;

        for (const item of cartItems) {
            const stockCheck = await client.query('SELECT stock, product_name FROM products WHERE id = $1', [item.product_id]);

            if (stockCheck.rows.length === 0) {
                throw new Error('Product not found');
            }

            const currentStock = Number(stockCheck.rows[0].stock);
            const itemQuantity = Number(item.quantity);

            if (currentStock < itemQuantity) {
                throw new Error(`Insufficient stock for ${stockCheck.rows[0].product_name}`);
            }

            await client.query(
                `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
                 VALUES ($1, $2, $3, $4)`,
                [orderId, item.product_id, itemQuantity, item.price]
            );
        }

        await client.query('COMMIT');
        return { orderId, totalPrice };
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error in createPendingOrder model:', err);
        throw err;
    } finally {
        client.release();
    }
};

export const markEsewaOrderPaid = async (transaction_uuid) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const orderResult = await client.query(
            `SELECT id, user_id, status
             FROM orders
             WHERE transaction_uuid = $1
             FOR UPDATE`,
            [transaction_uuid]
        );

        if (orderResult.rows.length === 0) {
            throw new Error('Order not found');
        }

        const order = orderResult.rows[0];

        if (order.status === 'paid') {
            await client.query('COMMIT');
            return order;
        }

        if (order.status !== 'pending') {
            throw new Error(`Order cannot be paid from ${order.status} status`);
        }

        const itemsResult = await client.query(
            `SELECT oi.product_id, oi.quantity, p.product_name, p.stock
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = $1
             FOR UPDATE OF p`,
            [order.id]
        );

        for (const item of itemsResult.rows) {
            const currentStock = Number(item.stock);
            const itemQuantity = Number(item.quantity);

            if (currentStock < itemQuantity) {
                throw new Error(`Insufficient stock for ${item.product_name}`);
            }

            await client.query(
                `UPDATE products SET stock = stock - $1 WHERE id = $2`,
                [itemQuantity, item.product_id]
            );
        }

        await client.query(
            "UPDATE orders SET status = 'paid' WHERE id = $1",
            [order.id]
        );

        await client.query(
            `DELETE FROM cart_items
             WHERE cart_id = (SELECT id FROM carts WHERE user_id = $1)`,
            [order.user_id]
        );

        await client.query('COMMIT');
        return order;
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error in markEsewaOrderPaid model:', err);
        throw err;
    } finally {
        client.release();
    }
};

export const markEsewaOrderFailed = async (transaction_uuid) => {
    await pool.query(
        "UPDATE orders SET status = 'failed' WHERE transaction_uuid = $1 AND status = 'pending'",
        [transaction_uuid]
    );
};

export const getUserOrders = async (userId) => {
    const result = await pool.query(
        `SELECT id, total_price, status, payment_method, created_at 
         FROM orders 
         WHERE user_id = $1 
         ORDER BY created_at DESC`,
        [userId]
    );
    return result.rows;
};
