import path from 'path';
import { fileURLToPath } from 'url';
import { getAllProducts} from '../models/productModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getUserDash = (req, res) => {
    res.sendFile(
        path.join(__dirname, '../../public/html/userDashboard.html')
    );
};


export const getAllProductsByUser = async (req, res)=>{
    try{
        const products = await getAllProducts();
        return res.status(200).json({
            products});
    }catch(err)
    {
        console.error(err);
        res.status(500).json({message: 'error getting the products'});
    }
};
