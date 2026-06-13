import pool from "../config/db.js";
import { getCartId, getCartItems } from "../models/cartModel.js";
import {
  getTotalAmount,
  generateTransactionUUID,
  generateSignature,
} from "../helper/calHelper.js";
import {
  createPendingOrder,
  markEsewaOrderFailed,
  markEsewaOrderPaid,
} from "../models/orderModel.js";

export const esewaPaymentController = async (req, res) => {
  const userId = req.user.id;
  try {
    const cartId = await getCartId(userId);

    if (!cartId) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const cartItems = await getCartItems(cartId);

    if (!cartItems || cartItems.length === 0) {
      return res.status(404).json({ message: "No items in cart" });
    }

    const amount = cartItems.reduce(
      (subtotal, item) => subtotal + Number(item.quantity) * Number(item.price),
      0,
    );
    const total_amount = getTotalAmount(amount);
    const transaction_uuid = generateTransactionUUID();
    const signature = generateSignature(total_amount, transaction_uuid);
    const shippingData = req.body;

    await createPendingOrder(
      userId,
      {
        ...shippingData,
        paymentMethod: "esewa",
        transaction_uuid,
      },
      cartItems,
    );

    return res.json({
      amount,
      tax_amount: 0,
      product_delivery_charge: total_amount - amount,
      total_amount,
      transaction_uuid,
      signature,
      product_code: "EPAYTEST",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const esewaSuccessController = async (req, res) => {
  const { data } = req.query;

  if (!data) {
    return res.redirect("/user/orderList?payment=failed");
  }

  try {
    const decodedData = JSON.parse(
      Buffer.from(data, "base64").toString("utf-8"),
    );
    const { transaction_uuid } = decodedData;

    const orderResult = await pool.query(
      "SELECT * FROM orders WHERE transaction_uuid = $1",
      [transaction_uuid],
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).send("Order not found");
    }

    const order = orderResult.rows[0];
    const product_code = "EPAYTEST";
    const lookupUrl = `https://rc-epay.esewa.com.np/api/epay/transaction/status/?product_code=${product_code}&total_amount=${order.total_price}&transaction_uuid=${transaction_uuid}`;

    const response = await fetch(lookupUrl);
    const lookupData = await response.json();

    console.log("eSewa Verification Response:", lookupData);

    if (lookupData.status === "COMPLETE") {
      await markEsewaOrderPaid(transaction_uuid);
      return res.redirect("/user/orderList?payment=success");
    }

    await markEsewaOrderFailed(transaction_uuid);
    return res.redirect("/user/orderList?payment=failed");
  } catch (err) {
    console.error("eSewa verification error:", err);
    return res.status(500).send("Internal Server Error during verification");
  }
};

export const esewaFailureController = (req, res) => {
  return res.redirect("/user/orderList?payment=failed");
};
