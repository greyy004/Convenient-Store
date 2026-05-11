import pool from '../src/config/db.js';

async function checkDatabase() {
    try {
        console.log('--- Carts ---');
        const carts = await pool.query('SELECT * FROM carts');
        console.table(carts.rows);

        console.log('--- Cart Items ---');
        const cartItems = await pool.query('SELECT * FROM cart_items');
        console.table(cartItems.rows);

        console.log('--- Users ---');
        const users = await pool.query('SELECT id, name, email FROM users');
        console.table(users.rows);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDatabase();
