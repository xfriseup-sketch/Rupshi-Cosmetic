import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import { dbNotConfiguredResponse } from "@/lib/dbStatus";
import Order, { ORDER_STATUSES } from "@/models/Order";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function maskName(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "Customer";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

function publicOrder(order) {
  const items = Array.isArray(order.items) ? order.items : [];
  const itemsCount = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const createdAt = order.createdAt ? new Date(order.createdAt) : null;
  const updatedAt = order.updatedAt ? new Date(order.updatedAt) : createdAt;

  // Soft estimate: 3 days after createdAt (Dhaka COD typical)
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
 * GET /api/orders/track?id=<mongoId>&phone=<01xxxxxxxxx>
 * Public, limited payload. No address, phone, or item names.
 */
export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;
    const id = (searchParams.get("id") || "").trim();
    const phone = (searchParams.get("phone") || "").trim();

    if (!id && !phone) {
      return NextResponse.json(
        { success: false, message: "Enter an order ID or phone number" },
        { status: 400 }
      );
    }

    const conn = await dbConnect();
    if (!conn) return dbNotConfiguredResponse();

    let order = null;

    if (id && mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id).lean();
    }

    if (!order && phone) {
      order = await Order.findOne({ phone }).sort({ createdAt: -1 }).lean();
    }

    if (!order) {
      return NextResponse.json(
        { success: false, message: "No order found with this ID/Phone" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, order: publicOrder(order) },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Track order error:", error);
    return NextResponse.json(
      { success: false, message: "Could not look up this order" },
      { status: 500 }
    );
  }
}
