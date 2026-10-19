import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Order, { ORDER_STATUSES } from "@/models/Order";

function maskName(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "Customer";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

export function toPublicOrder(order) {
  const items = Array.isArray(order.items) ? order.items : [];
  const itemsCount = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0
  );
  const createdAt = order.createdAt ? new Date(order.createdAt) : null;
  const updatedAt = order.updatedAt ? new Date(order.updatedAt) : createdAt;

  let estimatedDelivery = null;
  if (createdAt && !Number.isNaN(createdAt.getTime())) {
    const eta = new Date(createdAt);
    eta.setDate(eta.getDate() + 3);
    estimatedDelivery = eta.toISOString();
  }

  return {
    id: order._id.toString(),
    status: ORDER_STATUSES.includes(order.status) ? order.status : "pending",
    total: order.totalAmount,
    itemsCount,
    customerName: maskName(order.customerName),
    trackingNumber: order.trackingNumber || null,
    createdAt: createdAt ? createdAt.toISOString() : null,
    updatedAt: updatedAt ? updatedAt.toISOString() : null,
    estimatedDelivery,
  };
}

/**
 * Look up an order by Mongo _id and/or phone.
 * Returns { order } or { error, status }.
 */
export async function lookupPublicOrder({ id = "", phone = "" } = {}) {
  const cleanId = String(id || "").trim();
  const cleanPhone = String(phone || "").trim();

  if (!cleanId && !cleanPhone) {
    return { error: "Enter an order ID or phone number", status: 400 };
  }

  const conn = await dbConnect();
  if (!conn) {
    return { error: "Database is not configured", status: 503 };
  }

  let order = null;
  if (cleanId && mongoose.Types.ObjectId.isValid(cleanId)) {
    order = await Order.findById(cleanId).lean();
  }
  if (!order && cleanPhone) {
    order = await Order.findOne({ phone: cleanPhone })
      .sort({ createdAt: -1 })
      .lean();
  }

  if (!order) {
    return { error: "No order found with this ID/Phone", status: 404 };
  }

  return { order: toPublicOrder(order), status: 200 };
}
