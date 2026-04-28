import {addProductByAdmin} from '../models/productModel.js';

export const addProduct = async (req, res)=>{
    const {product_name, description, price, stock}=req.body;
    try{
    await addProductByAdmin(product_name, description, price, stock);
    res.status(201).json({
            message: "Product added successfully",
            product: {
                product_name,
                description,
                price,
                stock
            }
        });
    }
    catch(err)
    {
        return res.status(400).json({ message: err });
    }
};