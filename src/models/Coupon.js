import mongoose from "mongoose";

const CouponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [32, "Code too long"],
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: [true, "Discount type is required"],
      default: "percentage",
    },
    value: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [0, "Value cannot be negative"],
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    usageLimit: {
      type: Number,
      default: null, // null = unlimited
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    collection: "coupons",
    timestamps: true,
  }
);

/** Calculate discount amount for a given subtotal. Caps at subtotal. */
export function calculateDiscount(coupon, subtotal) {
  const sub = Math.max(0, Number(subtotal) || 0);
  if (sub <= 0) return 0;

  let discount = 0;
  if (coupon.discountType === "percentage") {
    const pct = Math.min(100, Math.max(0, Number(coupon.value) || 0));
    discount = Math.round((sub * pct) / 100);
  } else {
    discount = Math.round(Math.max(0, Number(coupon.value) || 0));
  }

  return Math.min(discount, sub);
}

/**
 * Validate a coupon against business rules.
 * Returns { ok: true, coupon, discount } or { ok: false, message }.
 */
export function validateCouponRules(coupon, subtotal) {
  if (!coupon) {
    return { ok: false, message: "Invalid promo code" };
  }
  if (!coupon.isActive) {
    return { ok: false, message: "This promo code is inactive" };
  }
  if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
    return { ok: false, message: "This promo code has expired" };
  }
  if (
    coupon.usageLimit != null &&
    Number(coupon.usedCount || 0) >= Number(coupon.usageLimit)
  ) {
    return { ok: false, message: "This promo code has reached its usage limit" };
  }
  const minOrder = Number(coupon.minOrderAmount || 0);
  const sub = Number(subtotal) || 0;
  if (minOrder > 0 && sub < minOrder) {
    return {
      ok: false,
      message: `Minimum order of ৳${minOrder.toLocaleString("en-BD")} required for this code`,
    };
  }

  const discount = calculateDiscount(coupon, sub);
  if (discount <= 0) {
    return { ok: false, message: "No discount applicable for this order" };
  }

  return { ok: true, coupon, discount };
}

const Coupon =
  mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);

export default Coupon;
