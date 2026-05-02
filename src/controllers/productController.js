import {addProductByAdmin, addCategory, getAllCategories} from '../models/productModel.js';

export const addProduct = async (req, res)=>{
    const {
        product_name,
        category_id,
        description,
        price,
        stock,
        product_img_url
    } = req.body || {};

    if (!product_name || price === undefined || stock === undefined) {
        return res.status(400).json({
            message: 'Product name, price, and stock are required'
        });
    }

    try{
    const parsedCategoryId = category_id ? Number(category_id) : null;
    if (category_id && !Number.isInteger(parsedCategoryId)) {
        return res.status(400).json({ message: 'Category must be valid' });
    }

    const product = await addProductByAdmin(product_name, parsedCategoryId, description, price, stock, product_img_url);
    res.status(201).json({
            message: "Product added successfully",
            product
        });
    }
    catch(err)
    {
        return res.status(400).json({ message: err.message || 'Failed to add product' });
    }
};

export const createCategory = async (req, res) => {
    const { name } = req.body || {};
    const categoryName = name?.trim();

    if (!categoryName) {
        return res.status(400).json({ message: 'Category name is required' });
    }

    try {
        const category = await addCategory(categoryName);
        return res.status(201).json({
            message: 'Category saved successfully',
            category
        });
    } catch (err) {
        return res.status(400).json({ message: err.message || 'Failed to save category' });
    }
};

export const getCategories = async (req, res) => {
    try {
        const categories = await getAllCategories();
        return res.status(200).json({ categories });
    } catch (err) {
        return res.status(500).json({ message: 'Failed to fetch categories' });
    }
};
