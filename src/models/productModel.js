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


export const addProductByAdmin = async (product_name, description, price, stock) => {
  try {
    console.log({ product_name, description, price, stock });
    const result = await pool.query(
      `INSERT INTO products (product_name, description, price, stock)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [product_name, description, price, stock]
    );

    return result.rows[0];

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Failed to add product'
    });
  }
};

export const ProductCount = async () => {
    const result = await pool.query(`
        SELECT COUNT(*) FROM products`
    );
    return result.rows[0].count;
}