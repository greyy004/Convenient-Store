import path from "path";
import { fileURLToPath } from "url";
import { getAllProducts, productDetails } from "../models/productModel.js";
import { addItemToCart, getCartItemsByUser } from "../models/cartModel.js";
import { getUserById } from "../models/userModel.js";
import { placeOrder, getUserOrders } from "../models/orderModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getUserDash = (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/html/userDashboard.html"));
};

export const getCheckout = (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/html/checkout.html"));
};

export const getOrderPage = (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/html/userOrderList.html"));
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
  } catch (err) {
    console.error("Error in getUserProfile controller:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllProductsByUser = async (req, res) => {
  try {
    const products = await getAllProducts();
    return res.status(200).json({
      products,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "error getting the products" });
  }
};

export const addToCart = async (req, res) => {
  try {
    const parsedProductId = Number(req.body.productId);
    const parsedQuantity = Number(req.body.quantity);
    const userId = req.user.id;

    if (!Number.isInteger(parsedProductId) || parsedProductId <= 0) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      return res
        .status(400)
        .json({ message: "Quantity must be a positive whole number" });
    }

    // 1. Get product stock
    const product = await productDetails(parsedProductId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const stock = Number(product.stock);

    // 2. Get existing cart items
    const cartItems = await getCartItemsByUser(userId);

    // 3. Find if product already exists in cart
    const existingCartItem = cartItems.find(
      (item) => Number(item.product_id) === parsedProductId,
    );

    const existingQuantity = existingCartItem
      ? Number(existingCartItem.quantity)
      : 0;

    const totalQuantity = existingQuantity + parsedQuantity;

    // 4. Stock validation
    if (totalQuantity > stock) {
      return res.status(400).json({
        message: `Only ${Math.max(stock - existingQuantity, 0)} items left in stock`,
      });
    }

    // 5. Add to cart only after validation
    await addItemToCart(userId, parsedProductId, parsedQuantity);

    return res.status(200).json({
      message: "Item added to cart successfully",
    });
  } catch (err) {
    console.error("Error in addToCart controller:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItems = await getCartItemsByUser(userId);
    return res.status(200).json({ cartItems });
  } catch (err) {
    console.error("Error in getCart controller:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const placeOrderController = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderData = req.body;

    // Get current cart items to save in order_items
    const cartItems = await getCartItemsByUser(userId);
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const result = await placeOrder(userId, orderData, cartItems);

    return res.status(200).json({
      message: "Order placed successfully",
      orderId: result.orderId,
    });
  } catch (err) {
    console.error("Error in placeOrder controller:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserOrdersController = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await getUserOrders(userId);
    return res.status(200).json({ orders });
  } catch (err) {
    console.error("Error in getUserOrdersController:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
