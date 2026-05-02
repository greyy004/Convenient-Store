import pool from '../config/db.js';

export const createProductTable = async () => {
    try {
        // Create Products Table
        const query = `
                CREATE TABLE IF NOT EXISTS products (
                    id SERIAL PRIMARY KEY,
                    product_name VARCHAR(100),
                    category_id INT,
                    description TEXT,
                    price DECIMAL(10, 2),
                    stock INT,
                    product_img_url TEXT,
                    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
                )
            `;
        await pool.query(query);
    } catch (err) {
        console.error('Error creating product table:', err);
    }
};

export const createCategoryTable = async () => {
    try {
        // Create Categories Table
        const query = `
                CREATE TABLE IF NOT EXISTS categories (
                    id SERIAL PRIMARY KEY, 
                    name VARCHAR(50) NOT NULL UNIQUE
                )
            `;
        await pool.query(query);
    }
    catch (err) {
        console.error('Error creating category table:', err);
    }
};


export const addCategory = async (name) => {
    const result = await pool.query(
        `INSERT INTO categories (name)
         VALUES ($1)
         ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
         RETURNING id, name`,
        [name]
    );
    return result.rows[0];
};

export const getAllCategories = async () => {
    const result = await pool.query(`
        SELECT id, name
        FROM categories
        ORDER BY name ASC
    `);
    return result.rows;
};

export const addProductByAdmin = async (product_name, category_id, description, price, stock, product_img_url = null) => {
  try {
    const result = await pool.query(
      `INSERT INTO products (product_name, category_id, description, price, stock, product_img_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [product_name, category_id, description, price, stock, product_img_url]
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
        SELECT
            p.id,
            p.product_name,
            p.category_id,
            c.name AS category_name,
            p.description,
            p.price,
            p.stock,
            p.product_img_url
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.stock > 0
        ORDER BY p.id DESC
    `);
    return result.rows;
};
