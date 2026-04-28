import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import {fileURLToPath} from 'url';
import authRoutes from './src/routes/authRoutes.js';
import initdb from './src/config/initdb.js';
import pool from './src/config/db.js';
import userRoutes from './src/routes/userRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import {requireAdmin, requireAuth} from './src/middlewares/middleware.js'
import cookieParser from 'cookie-parser';


dotenv.config();
const PORT = process.env.PORT || 5000;
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'public','html','index.html'));
});

app.use('/auth', authRoutes);
app.use('/admin', requireAuth, requireAdmin, adminRoutes);
app.use('/user', requireAuth, userRoutes);
app.use('/products', requireAuth, requireAdmin, productRoutes);
const startServer = async () => {
    try {
        // Initialize the database
        await initdb();
        // Test database connection
        await pool.query('SELECT NOW()');
        console.log('Database connected successfully!');
        // Start the server
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
    }
};

startServer();