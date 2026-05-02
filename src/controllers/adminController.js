import path from 'path';
import { fileURLToPath } from 'url';
import {
    UserCount,
    getAllUsers
} from '../models/userModel.js';
import {
    ProductCount,
    getAllProducts
} from '../models/productModel.js';
import pool from '../config/db.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getAdminDash = (req, res) => {
    res.sendFile(
        path.join(__dirname, '../../public/html/adminDashboard.html')
    );
};

export const getUsersPage = (req, res) => {
    res.sendFile(
        path.join(__dirname, '../../public/html/adminUsers.html')
    );
};

export const getProductsPage = (req, res) => {
    res.sendFile(
        path.join(__dirname, '../../public/html/adminProducts.html')
    );
};

export const getUserCount = async (req, res) => {
    try {
        const totalUsers = await UserCount();
        if (totalUsers === undefined || totalUsers === null) {
            return res.status(400).json({ message: "total users not found" });
        }
        return res.status(200).json({totalUsers: totalUsers});
    } catch (err){
    return res.status(400).json({ message: "error in the database" });}
};


export const getProductCount = async (req, res) => {
     try {
        const totalProducts = await ProductCount();
        if (totalProducts === undefined || totalProducts === null) {
            return res.status(400).json({ message: "total products not found" });
        }
        return res.status(200).json({totalProducts: totalProducts});
    } catch (err){
    return res.status(400).json({ message: "error in the database" });}
};

export const getUsers = async (req, res) => {
    try {
        const users = await getAllUsers();
        return res.status(200).json({ users });
    } catch (err) {
        return res.status(500).json({ message: "error fetching users" });
    }
};

export const getProducts = async (req, res) => {
    try {
        const products = await getAllProducts();
        return res.status(200).json({ products });
    } catch (err) {
        return res.status(500).json({ message: "error fetching products" });
    }
};

export const getSalesData = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.product_name, COALESCE(SUM(oi.quantity), 0) AS total_quantity
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            GROUP BY p.id, p.product_name
            ORDER BY total_quantity DESC
            LIMIT 5
        `);

        return res.status(200).json({
            labels: result.rows.map((row) => row.product_name),
            values: result.rows.map((row) => Number(row.total_quantity))
        });
    } catch (err) {
        return res.status(500).json({ message: "error fetching sales data" });
    }
};
