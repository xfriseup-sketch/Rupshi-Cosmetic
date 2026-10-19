import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import { dbNotConfiguredResponse } from "@/lib/dbStatus";
import Coupon from "@/models/Coupon";

export const dynamic = "force-dynamic";

function serialize(c) {
  return {
    ...c,
    _id: c._id.toString(),
    expiryDate: c.expiryDate ? new Date(c.expiryDate).toISOString() : null,
    createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : null,
    updatedAt: c.updatedAt ? new Date(c.updatedAt).toISOString() : null,
  };
}

export async function GET() {
  try {
    const conn = await dbConnect();
    if (!conn) return dbNotConfiguredResponse();

    const coupons = await Coupon.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({
      success: true,
      count: coupons.length,
      coupons: coupons.map(serialize),
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { success: false, message: "Could not load coupons" },
      { status: 500 }
    );
  }
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

    const code = String(body.code || "")
      .trim()
      .toUpperCase();
    const discountType = body.discountType === "fixed" ? "fixed" : "percentage";
    const value = Number(body.value);
    const minOrderAmount = Math.max(0, Number(body.minOrderAmount) || 0);
    const isActive = body.isActive !== false;
    const usageLimit =
      body.usageLimit === "" || body.usageLimit == null
        ? null
        : Math.max(1, Math.floor(Number(body.usageLimit)));
    const expiryDate = body.expiryDate ? new Date(body.expiryDate) : null;

    const errors = {};
    if (!code) errors.code = "Code is required";
    else if (!/^[A-Z0-9_-]{2,32}$/.test(code)) {
      errors.code = "Code may only contain A-Z, 0-9, _ and -";
    }
    if (!Number.isFinite(value) || value <= 0) {
      errors.value = "Value must be greater than 0";
    }
    if (discountType === "percentage" && value > 100) {
      errors.value = "Percentage cannot exceed 100";
    }
    if (expiryDate && Number.isNaN(expiryDate.getTime())) {
      errors.expiryDate = "Invalid expiry date";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors },
        { status: 400 }
      );
    }

    const conn = await dbConnect();
    if (!conn) return dbNotConfiguredResponse();

    const exists = await Coupon.findOne({ code }).lean();
    if (exists) {
      return NextResponse.json(
        { success: false, message: "A coupon with this code already exists" },
        { status: 409 }
      );
    }

    const coupon = await Coupon.create({
      code,
      discountType,
      value,
      minOrderAmount,
      expiryDate,
      isActive,
      usageLimit,
      usedCount: 0,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Coupon created",
        coupon: serialize(coupon.toObject()),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating coupon:", error);
    if (error?.code === 11000) {
      return NextResponse.json(
        { success: false, message: "A coupon with this code already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, message: error?.message || "Could not create coupon" },
      { status: 500 }
    );
  }
}

/** PUT /api/coupons?id=<id> */
export async function PUT(request) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid coupon ID" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "Invalid request body" },
        { status: 400 }
      );
    }

    const update = {};
    if (body.code != null) {
      const code = String(body.code).trim().toUpperCase();
      if (!/^[A-Z0-9_-]{2,32}$/.test(code)) {
        return NextResponse.json(
          { success: false, message: "Invalid code format" },
          { status: 400 }
        );
      }
      update.code = code;
    }
    if (body.discountType != null) {
      update.discountType = body.discountType === "fixed" ? "fixed" : "percentage";
    }
    if (body.value != null) {
      const value = Number(body.value);
      if (!Number.isFinite(value) || value <= 0) {
        return NextResponse.json(
          { success: false, message: "Value must be greater than 0" },
          { status: 400 }
        );
      }
      update.value = value;
    }
    if (body.minOrderAmount != null) {
      update.minOrderAmount = Math.max(0, Number(body.minOrderAmount) || 0);
    }
    if (body.isActive != null) update.isActive = Boolean(body.isActive);
    if (body.usageLimit !== undefined) {
      update.usageLimit =
        body.usageLimit === "" || body.usageLimit == null
          ? null
          : Math.max(1, Math.floor(Number(body.usageLimit)));
    }
    if (body.expiryDate !== undefined) {
      update.expiryDate = body.expiryDate ? new Date(body.expiryDate) : null;
    }

    const conn = await dbConnect();
    if (!conn) return dbNotConfiguredResponse();

    if (update.code) {
      const dup = await Coupon.findOne({
        code: update.code,
        _id: { $ne: id },
      }).lean();
      if (dup) {
        return NextResponse.json(
          { success: false, message: "Another coupon already uses this code" },
          { status: 409 }
        );
      }
    }

    const coupon = await Coupon.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).lean();

    if (!coupon) {
      return NextResponse.json(
        { success: false, message: "Coupon not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Coupon updated",
      coupon: serialize(coupon),
    });
  } catch (error) {
    console.error("Error updating coupon:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Could not update coupon" },
      { status: 500 }
    );
  }
}

/** DELETE /api/coupons?id=<id> */
export async function DELETE(request) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid coupon ID" },
        { status: 400 }
      );
    }

    const conn = await dbConnect();
    if (!conn) return dbNotConfiguredResponse();

    const coupon = await Coupon.findByIdAndDelete(id).lean();
    if (!coupon) {
      return NextResponse.json(
        { success: false, message: "Coupon not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Coupon deleted",
    });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return NextResponse.json(
      { success: false, message: "Could not delete coupon" },
      { status: 500 }
    );
  }
}
