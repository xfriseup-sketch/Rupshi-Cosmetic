import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { dbNotConfiguredResponse } from "@/lib/dbStatus";
import Coupon, { validateCouponRules } from "@/models/Coupon";

export const dynamic = "force-dynamic";

/**
 * POST /api/coupons/validate
 * Body: { code: string, subtotal: number }
 * Returns discount amount if valid, or error message.
 */
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
    const subtotal = Number(body.subtotal);

    if (!code) {
      return NextResponse.json(
        { success: false, message: "Please enter a promo code" },
        { status: 400 }
      );
    }
    if (!Number.isFinite(subtotal) || subtotal < 0) {
      return NextResponse.json(
        { success: false, message: "Invalid cart subtotal" },
        { status: 400 }
      );
    }

    const conn = await dbConnect();
    if (!conn) return dbNotConfiguredResponse();

    const coupon = await Coupon.findOne({ code }).lean();
    const result = validateCouponRules(coupon, subtotal);

    if (!result.ok) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Promo code applied",
      code: result.coupon.code,
      discountType: result.coupon.discountType,
      value: result.coupon.value,
      discount: result.discount,
      minOrderAmount: result.coupon.minOrderAmount || 0,
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    return NextResponse.json(
      { success: false, message: "Could not validate promo code" },
      { status: 500 }
    );
  }
}
