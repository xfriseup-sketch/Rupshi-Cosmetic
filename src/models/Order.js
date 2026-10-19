import mongoose from "mongoose";

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

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
    couponCode: {
      type: String,
      default: null,
      trim: true,
      uppercase: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "orders" }
);

let Order = mongoose.models.Order;

if (!Order) {
  Order = mongoose.model("Order", OrderSchema);
} else if (Order.schema.path("status")) {
  Order.schema.path("status").enumValues = ORDER_STATUSES;
}

export { ORDER_STATUSES };
export default Order;
