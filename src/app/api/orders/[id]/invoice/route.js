import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import { dbNotConfiguredResponse } from "@/lib/dbStatus";
import Order from "@/models/Order";
import { generateInvoicePdf } from "@/utils/generateInvoicePdf";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_request, context) {
  try {
    const { id } = await context.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid order ID" },
        { status: 400 }
      );
    }

    const conn = await dbConnect();
    if (!conn) return dbNotConfiguredResponse();

    const order = await Order.findById(id).lean();
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    const pdf = await generateInvoicePdf({
      ...order,
      _id: order._id.toString(),
    });

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Rupshi-Invoice-${order._id}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Invoice PDF error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Could not generate invoice",
      },
      { status: 500 }
    );
  }
}
