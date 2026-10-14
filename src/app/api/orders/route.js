import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import { dbNotConfiguredResponse } from "@/lib/dbStatus";
import Order from "@/models/Order";
import Product from "@/models/Product";

// Orders are read/written live — never cache this route
export const dynamic = "force-dynamic";

const SHIPPING_COST = 60; // Fixed delivery charge in BDT (must match frontend)

/**
 * Normalize an incoming id (Mongo ObjectId string or product _id) to a string.
 */
function toIdString(value) {
  if (!value) return null;
  return typeof value === "object" && value._id ? String(value._id) : String(value);
}

/**
 * POST /api/orders
 * Receives { customerName, phone, address, items }, validates the data,
 * verifies product prices against MongoDB server-side, computes the total
 * amount and saves the order. Returns the created order on success.
 */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "অবৈধ রিকোয়েস্ট বডি" },
        { status: 400 }
      );
    }

    const customerName = (body.customerName || "").trim();
    const phone = (body.phone || "").trim();
    const address = (body.address || "").trim();
    const rawItems = Array.isArray(body.items) ? body.items : [];

    // ---- Basic field validation (mirrors the client form) ----
    const errors = {};
    if (!customerName) errors.customerName = "নাম আবশ্যক";
    if (!phone) {
      errors.phone = "ফোন নম্বর আবশ্যক";
    } else if (!/^(\+?8801|01)[3-9]\d{8}$/.test(phone)) {
      errors.phone = "সঠিক ফোন নম্বর দিন (যেমন: 01XXXXXXXXX)";
    }
    if (!address) errors.address = "ঠিকানা আবশ্যক";
    if (rawItems.length === 0) errors.items = "কার্ট খালি";

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, message: "প্রদত্ত তথ্যে সমস্যা আছে", errors },
        { status: 400 }
      );
    }

    const conn = await dbConnect();
    if (!conn) return dbNotConfiguredResponse();

    // ---- Server-side price verification against DB ----
    const objectIds = rawItems
      .map((item) => toIdString(item.productId ?? item._id ?? item.id))
      .filter((id) => id && mongoose.Types.ObjectId.isValid(id));

    if (objectIds.length !== rawItems.length) {
      return NextResponse.json(
        {
          success: false,
          message: "প্রোডাক্ট আইডিতে সমস্যা আছে",
          errors: { items: "অবৈধ প্রোডাক্ট" },
        },
        { status: 400 }
      );
    }

    const products = await Product.find({ _id: { $in: objectIds } }).lean();
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const items = [];
    for (const raw of rawItems) {
      const id = toIdString(raw.productId ?? raw._id ?? raw.id);
      const product = productMap.get(id);

      if (!product) {
        return NextResponse.json(
          {
            success: false,
            message: "কার্টের কিছু পণ্য এখন উপলব্ধ নয়",
            errors: { items: "পণ্য পাওয়া যায়নি" },
          },
          { status: 400 }
        );
      }

      const quantity = Math.max(1, Math.floor(Number(raw.quantity) || 1));
      items.push({
        productId: id,
        name: product.name,
        price: product.price,
        quantity,
      });
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalAmount = subtotal + SHIPPING_COST;

    // ---- Save the order ----
    let order;
    try {
      order = await Order.create({
        customerName,
        phone,
        address,
        items,
        totalAmount,
      });
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        const fieldErrors = {};
        for (const [field, err] of Object.entries(error.errors)) {
          fieldErrors[field] = err.message;
        }
        return NextResponse.json(
          { success: false, message: "অর্ডার সেভ করা যায়নি", errors: fieldErrors },
          { status: 400 }
        );
      }
      throw error;
    }

    return NextResponse.json(
      {
        success: true,
        message: "আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে!",
        orderId: order._id.toString(),
        order: {
          _id: order._id.toString(),
          customerName: order.customerName,
          phone: order.phone,
          address: order.address,
          items: order.items,
          totalAmount: order.totalAmount,
          status: order.status,
          createdAt: order.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, message: "অর্ডার গ্রহণ করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orders
 * Returns all orders (useful for admin/debugging in this demo phase).
 */
export async function GET() {
  try {
    const conn = await dbConnect();
    if (!conn) return dbNotConfiguredResponse();

    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      count: orders.length,
      orders: orders.map((order) => ({
        ...order,
        _id: order._id.toString(),
        createdAt: order.createdAt ? order.createdAt.toISOString() : null,
      })),
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, message: "অর্ডার লোড করা যায়নি" },
      { status: 500 }
    );
  }
}
