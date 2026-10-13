import mongoose from "mongoose";

/**
 * Order schema — stores customer info, purchased items snapshot,
 * total amount and order status.
 */
const OrderSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      // Accepts local (01XXXXXXXXX) and international (+8801XXXXXXXXX) formats
      match: [/^(\+?8801|01)[3-9]\d{8}$/, "Please provide a valid Bangladeshi phone number"],
    },
    address: {
      type: String,
      required: [true, "Delivery address is required"],
      trim: true,
    },
    items: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },
    status: {
      type: String,
      enum: ["pending", "processing", "delivered"],
      default: "pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "orders" }
);

// Prevent overwriting the model on hot reloads / repeated imports
const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

export default Order;
