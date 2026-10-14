import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import { dbNotConfiguredResponse } from "@/lib/dbStatus";
import Order from "@/models/Order";

// Orders are read/written live — never cache this route
export const dynamic = "force-dynamic";

const VALID_STATUSES = ["pending", "processing", "delivered"];

/**
 * PATCH /api/orders/[id]
 * Updates the status of an order (used by the admin panel).
 * Expects a JSON body: { status: "pending" | "processing" | "delivered" }
 */
export async function PATCH(request, { params }) {
  try {
    const { id } = params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "অবৈধ অর্ডার আইডি" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => null);
    const status = body?.status;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "অবৈধ স্ট্যাটাস",
          errors: { status: `স্ট্যাটাস হতে হবে: ${VALID_STATUSES.join(", ")}` },
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
        { success: false, message: "অর্ডার পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "অর্ডারের স্ট্যাটাস আপডেট হয়েছে",
      order: {
        ...order,
        _id: order._id.toString(),
        createdAt: order.createdAt ? order.createdAt.toISOString() : null,
      },
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { success: false, message: "অর্ডার আপডেট করা যায়নি" },
      { status: 500 }
    );
  }
}
