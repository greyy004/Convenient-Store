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
        `SELECT id, name, email, password, is_admin
         FROM users
         WHERE email = $1`,
        [email]
    );
    return result.rows[0];
};

export const createUser = async ({ name, email, password_hash }) => {
    await pool.query(
        `INSERT INTO users (name, email, password)
         VALUES ($1, $2, $3)`,
        [name, email, password_hash]
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

