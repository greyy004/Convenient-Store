import pool from '../config/db.js';

export const createUserTable = async () => {
    try {
        // Create Users Table
        const query = `
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100),
                    email VARCHAR(100) UNIQUE,
                    password VARCHAR(255),
                    address TEXT,
                    phone VARCHAR(20),
                    country VARCHAR(100) DEFAULT 'Nepal',
                    is_admin BOOLEAN DEFAULT FALSE
                )
            `;
        await pool.query(query);
    } catch (err) {
        console.error('Error creating user table:', err);
    }
};

export const getUserByEmail = async (email) => {
    const result = await pool.query(
        `SELECT id, name, email, password, address, phone, country, is_admin
         FROM users
         WHERE email = $1`,
        [email]
    );
    return result.rows[0];
};

export const getUserById = async (id) => {
    const result = await pool.query(
        `SELECT id, name, email, address, phone, country, is_admin
         FROM users
         WHERE id = $1`,
        [id]
    );
    return result.rows[0];
};

export const createUser = async ({ name, email, password_hash, address, phone, country }) => {
    await pool.query(
        `INSERT INTO users (name, email, password, address, phone, country)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [name, email, password_hash, address || null, phone || null, country || 'Nepal']
    );
};

export const UserCount = async () => {
    const result = await pool.query(`
        SELECT COUNT(*) FROM users where is_admin=false`
    );
    return result.rows[0].count;
};

export const getAllUsers = async () => {
    const result = await pool.query(`
        SELECT id, name, email
        FROM users
        WHERE is_admin = false
        ORDER BY id DESC
    `);
    return result.rows;
};

