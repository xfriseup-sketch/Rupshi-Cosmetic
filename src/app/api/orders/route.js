import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import { dbNotConfiguredResponse } from "@/lib/dbStatus";
import Order, { ORDER_STATUSES } from "@/models/Order";
import Product from "@/models/Product";
import Coupon, { validateCouponRules } from "@/models/Coupon";

export const dynamic = "force-dynamic";

const SHIPPING_COST = 60;

function toIdString(value) {
  if (!value) return null;
  return typeof value === "object" && value._id ? String(value._id) : String(value);
}

function serializeOrder(order) {
  return {
    ...order,
    _id: order._id.toString(),
    createdAt: order.createdAt ? order.createdAt.toISOString() : null,
  };
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "Invalid request body" },
        { status: 400 }
      );
    }

    const customerName = (body.customerName || "").trim();
    const phone = (body.phone || "").trim();
    const address = (body.address || "").trim();
    const rawItems = Array.isArray(body.items) ? body.items : [];
    const couponCode = body.couponCode
      ? String(body.couponCode).trim().toUpperCase()
      : null;

    const errors = {};
    if (!customerName) errors.customerName = "Name is required";
    if (!phone) {
      errors.phone = "Phone is required";
    } else if (!/^(\+?8801|01)[3-9]\d{8}$/.test(phone)) {
      errors.phone = "Invalid Bangladeshi phone number";
    }
    if (!address) errors.address = "Address is required";
    if (rawItems.length === 0) errors.items = "Cart is empty";

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors },
        { status: 400 }
      );
    }

    const conn = await dbConnect();
    if (!conn) return dbNotConfiguredResponse();

    const objectIds = rawItems
      .map((item) => toIdString(item.productId ?? item._id ?? item.id))
      .filter((id) => id && mongoose.Types.ObjectId.isValid(id));

    if (objectIds.length !== rawItems.length) {
      return NextResponse.json(
        { success: false, message: "Invalid product IDs", errors: { items: "Invalid product" } },
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
          { success: false, message: "Some products are unavailable", errors: { items: "Not found" } },
          { status: 400 }
        );
      }

      const quantity = Math.max(1, Math.floor(Number(raw.quantity) || 1));
      const unitPrice =
        product.discountPrice != null && product.discountPrice < product.price
          ? product.discountPrice
          : product.price;
      items.push({
        productId: id,
        name: product.name,
        price: unitPrice,
        quantity,
      });
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Server-side coupon re-validation (never trust client discount)
    let discountAmount = 0;
    let appliedCouponCode = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode }).lean();
      const result = validateCouponRules(coupon, subtotal);
      if (!result.ok) {
        return NextResponse.json(
          { success: false, message: result.message, errors: { coupon: result.message } },
          { status: 400 }
        );
      }
      discountAmount = result.discount;
      appliedCouponCode = result.coupon.code;
    }

    const totalAmount = Math.max(0, subtotal - discountAmount) + SHIPPING_COST;

    const order = await Order.create({
      customerName,
      phone,
      address,
      items,
      totalAmount,
      couponCode: appliedCouponCode,
      discountAmount,
    });

    // Increment coupon usage after successful order
    if (appliedCouponCode) {
      await Coupon.updateOne(
        { code: appliedCouponCode },
        { $inc: { usedCount: 1 } }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Order placed successfully",
        orderId: order._id.toString(),
        order: serializeOrder(order.toObject()),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    if (error instanceof mongoose.Error.ValidationError) {
      const fieldErrors = {};
      for (const [field, err] of Object.entries(error.errors)) {
        fieldErrors[field] = err.message;
      }
      return NextResponse.json(
        { success: false, message: "Could not save order", errors: fieldErrors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Could not place order. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const conn = await dbConnect();
    if (!conn) return dbNotConfiguredResponse();

    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      count: orders.length,
      orders: orders.map(serializeOrder),
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, message: "Could not load orders" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const id = request.nextUrl.searchParams.get("id");

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid order ID" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => null);
    const status = (body?.status || "").trim().toLowerCase();

    if (!ORDER_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid status. Allowed: ${ORDER_STATUSES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const conn = await dbConnect();
    if (!conn) return dbNotConfiguredResponse();

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).lean();

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order status updated",
      order: serializeOrder(order),
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Could not update order" },
      { status: 500 }
    );
  }
}
