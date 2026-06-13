import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const deliveryCharge = 100;
const product_code = "EPAYTEST";

export const getTotalAmount = (subtotal) => {
  return subtotal + deliveryCharge;
};

export const generateTransactionUUID = () => {
  return crypto.randomBytes(16).toString("hex");
};

export const generateSignature = (amount, transaction_uuid) => {
  const secretKey = process.env.SECRET_KEY;

  if (!secretKey) {
    throw new Error("SECRET_KEY is missing");
  }

  const message =
    `total_amount=${String(amount)},` +
    `transaction_uuid=${String(transaction_uuid)},` +
    `product_code=${String(product_code)}`;

  const hash = crypto
    .createHmac("sha256", secretKey)
    .update(message.trim())
    .digest("base64");

  return hash;
};
