import pool from '../config/db.js';

export const createProductTable = async () => {
    try {
        // Create Products Table
        const query = `
                CREATE TABLE IF NOT EXISTS products (
                    id SERIAL PRIMARY KEY,
                    product_name VARCHAR(100),
                    description TEXT,
                    price DECIMAL(10, 2),
                    stock INT,
                    product_img_url TEXT
                )
            `;
        await pool.query(query);
    } catch (err) {
        console.error('Error creating product table:', err);
    }
};


export const addProductByAdmin = async (product_name, description, price, stock, product_img_url = null) => {
  try {
    const result = await pool.query(
      `INSERT INTO products (product_name, description, price, stock, product_img_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [product_name, description, price, stock, product_img_url]
    );

    return result.rows[0];

  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const ProductCount = async () => {
    const result = await pool.query(`
        SELECT COUNT(*) FROM products`
    );
    return result.rows[0].count;
};

export const getAllProducts = async () => {
    const result = await pool.query(`
        SELECT id, product_name, description, price, stock, product_img_url
        FROM products where stock > 0
        ORDER BY id DESC
    `);
    return result.rows;
};
