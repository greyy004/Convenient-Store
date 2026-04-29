import {addProductByAdmin} from '../models/productModel.js';

export const addProduct = async (req, res)=>{
    const {
        product_name,
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
    const product = await addProductByAdmin(product_name, description, price, stock, product_img_url);
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
