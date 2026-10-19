"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Ticket, X } from "lucide-react";

const SHIPPING_COST = 60;
const PHONE_REGEX = /^(\+?8801|01)[3-9]\d{8}$/;
const COUPON_KEY = "rupshi-applied-coupon";

const formatBDT = (amount) => `৳${new Intl.NumberFormat("bn-BD").format(amount)}`;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart, showToast } = useCart();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [form, setForm] = useState({ customerName: "", phone: "", address: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  // Coupon state
  const [promoInput, setPromoInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discount }
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");

  // Restore applied coupon from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(COUPON_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.code && typeof parsed.discount === "number") {
          setAppliedCoupon(parsed);
          setPromoInput(parsed.code);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  const subtotal = totalPrice;
  const discount = appliedCoupon?.discount || 0;
  const grandTotal = Math.max(0, subtotal - discount) + (items.length > 0 ? SHIPPING_COST : 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const applyPromo = async () => {
    const code = promoInput.trim();
    if (!code) {
      setPromoError("প্রোমো কোড লিখুন");
      setPromoSuccess("");
      return;
    }
    setPromoLoading(true);
    setPromoError("");
    setPromoSuccess("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        const coupon = { code: data.code, discount: data.discount };
        setAppliedCoupon(coupon);
        setPromoSuccess(`ডিসকাউন্ট প্রয়োগ হয়েছে: ${formatBDT(data.discount)} ছাড়`);
        try {
          localStorage.setItem(COUPON_KEY, JSON.stringify(coupon));
        } catch {
          /* ignore */
        }
      } else {
        setAppliedCoupon(null);
        setPromoError(data?.message || "অবৈধ প্রোমো কোড");
        try {
          localStorage.removeItem(COUPON_KEY);
        } catch {
          /* ignore */
        }
      }
    } catch {
      setPromoError("নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন");
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromo = () => {
    setAppliedCoupon(null);
    setPromoInput("");
    setPromoError("");
    setPromoSuccess("");
    try {
      localStorage.removeItem(COUPON_KEY);
    } catch {
      /* ignore */
    }
  };

  // Re-validate if cart subtotal changes while coupon is applied
  useEffect(() => {
    if (!appliedCoupon?.code || !mounted || items.length === 0) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/coupons/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: appliedCoupon.code, subtotal }),
        });
        const data = await res.json().catch(() => null);
        if (cancelled) return;
        if (res.ok && data?.success) {
          const coupon = { code: data.code, discount: data.discount };
          setAppliedCoupon(coupon);
          try {
            localStorage.setItem(COUPON_KEY, JSON.stringify(coupon));
          } catch {
            /* ignore */
          }
        } else {
          setAppliedCoupon(null);
          setPromoError(data?.message || "প্রোমো কোড আর বৈধ নয়");
          setPromoSuccess("");
          try {
            localStorage.removeItem(COUPON_KEY);
          } catch {
            /* ignore */
          }
        }
      } catch {
        /* keep existing */
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal, mounted]);

  const validate = () => {
    const next = {};
    if (!form.customerName.trim()) next.customerName = "আপনার নাম লিখুন";
    if (!form.phone.trim()) {
      next.phone = "ফোন নম্বর লিখুন";
    } else if (!PHONE_REGEX.test(form.phone.trim())) {
      next.phone = "সঠিক ফোন নম্বর দিন (যেমন: 01XXXXXXXXX)";
    }
    if (!form.address.trim()) next.address = "সম্পূর্ণ ঠিকানা লিখুন";
    if (items.length === 0) next.items = "আপনার কার্ট খালি";
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          couponCode: appliedCoupon?.code || null,
          items: items.map((item) => ({
            productId: item._id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const fieldErrors = data.errors || {};
        setErrors(fieldErrors);
        setServerError(
          res.status === 503 || data.dbConfigured === false
            ? "ডাটাবেস কনফিগার করা হয়নি। দয়া করে MONGODB_URI সেট করুন।"
            : fieldErrors.coupon
            ? fieldErrors.coupon
            : fieldErrors.phone
            ? "তথ্যে সমস্যা আছে, অনুগ্রহ করে সংশোধন করুন।"
            : data.message || "অর্ডার গ্রহণ করা যায়নি। আবার চেষ্টা করুন।"
        );
        setSubmitting(false);
        return;
      }

      clearCart();
      try {
        localStorage.removeItem(COUPON_KEY);
      } catch {
        /* ignore */
      }
      showToast("অর্ডার সফল হয়েছে!");
      router.push(`/order-success?orderId=${encodeURIComponent(data.orderId)}`);
    } catch (error) {
      console.error("Checkout failed:", error);
      setServerError("ইন্টারনেট সংযোগে সমস্যা হচ্ছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
      setSubmitting(false);
    }
  };

  const inputClass = (field) =>
    `w-full rounded-xl border px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 ${
      errors[field]
        ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-200"
        : "border-pink-200 bg-white focus:border-[#db2777] focus:ring-pink-200"
    }`;

  return (
    <main className="min-h-screen bg-pink-50">
      <section className="bg-gradient-to-br from-pink-100 via-pink-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-10 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            চেকআউট — <span className="text-[#db2777]">অর্ডার সম্পন্ন করুন</span>
          </h1>
          <p className="mt-2 text-gray-600">
            আপনার তথ্য দিন, আমরা ক্যাশ অন ডেলিভারিতে পণ্য পৌঁছে দেবো
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        {!mounted ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-pink-200 border-t-[#db2777]" />
            <p className="text-xl font-semibold text-[#db2777]">লোড হচ্ছে...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl bg-white p-10 text-center shadow-lg shadow-pink-100">
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-pink-50">
              <Ticket size={28} className="text-pink-400" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">আপনার কার্ট খালি</h2>
            <p className="mt-2 text-gray-600">
              চেকআউট করতে আগে কিছু পণ্য কার্টে যোগ করুন।
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-block rounded-full bg-[#db2777] px-8 py-3 font-semibold text-white transition hover:bg-[#9d174d]"
            >
              কেনাকাটা শুরু করো
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="lg:col-span-3 rounded-2xl bg-white p-6 md:p-8 shadow-lg shadow-pink-100"
            >
              <h2 className="text-xl font-bold text-gray-900">
                <span className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#db2777] text-sm text-white">
                  ১
                </span>
                ডেলিভারি তথ্য
              </h2>

              <div className="mt-6 space-y-5">
                <div>
                  <label htmlFor="customerName" className="mb-1.5 block text-sm font-semibold text-gray-700">
                    নাম <span className="text-[#db2777]">*</span>
                  </label>
                  <input
                    id="customerName"
                    name="customerName"
                    type="text"
                    value={form.customerName}
                    onChange={handleChange}
                    placeholder="আপনার পূর্ণ নাম"
                    className={inputClass("customerName")}
                    aria-invalid={!!errors.customerName}
                  />
                  {errors.customerName && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.customerName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-gray-700">
                    ফোন নম্বর <span className="text-[#db2777]">*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="01XXXXXXXXX"
                    className={inputClass("phone")}
                    aria-invalid={!!errors.phone}
                  />
                  {errors.phone && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="address" className="mb-1.5 block text-sm font-semibold text-gray-700">
                    সম্পূর্ণ ঠিকানা <span className="text-[#db2777]">*</span>
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    rows={4}
                    value={form.address}
                    onChange={handleChange}
                    placeholder="বাসা/হোল্ডিং নম্বর, রোড, এলাকা, থানা, জেলা"
                    className={`${inputClass("address")} resize-none`}
                    aria-invalid={!!errors.address}
                  />
                  {errors.address && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.address}</p>
                  )}
                </div>
              </div>

              {serverError && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {serverError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-7 w-full rounded-full bg-[#db2777] px-8 py-4 text-lg font-bold text-white shadow-lg shadow-pink-200 transition hover:bg-[#9d174d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    প্রসেসিং...
                  </span>
                ) : (
                  "অর্ডার কনফার্ম করুন"
                )}
              </button>
              <p className="mt-3 text-center text-sm text-gray-500">
                পেমেন্ট: ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে টাকা পরিশোধ করুন)
              </p>
            </form>

            <aside className="lg:col-span-2">
              <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-lg shadow-pink-100">
                <h2 className="text-xl font-bold text-gray-900">
                  <span className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#db2777] text-sm text-white">
                    ২
                  </span>
                  অর্ডার সারাংশ
                </h2>

                <ul className="mt-5 divide-y divide-pink-100">
                  {items.map((item) => (
                    <li key={item._id} className="flex items-center gap-3 py-3">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-pink-100">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatBDT(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-gray-900">
                        {formatBDT(item.price * item.quantity)}
                      </p>
                    </li>
                  ))}
                </ul>

                {/* Promo code */}
                <div className="mt-4 border-t border-pink-100 pt-4">
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    প্রোমো কোড
                  </label>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                      <div>
                        <p className="font-mono text-sm font-bold text-emerald-800">
                          {appliedCoupon.code}
                        </p>
                        <p className="text-xs text-emerald-600">
                          −{formatBDT(appliedCoupon.discount)} ছাড়
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={removePromo}
                        className="rounded-lg p-1.5 text-emerald-700 hover:bg-emerald-100"
                        title="Remove"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => {
                          setPromoInput(e.target.value.toUpperCase());
                          setPromoError("");
                          setPromoSuccess("");
                        }}
                        placeholder="GLOW20"
                        className="min-w-0 flex-1 rounded-xl border border-pink-200 px-3 py-2.5 font-mono text-sm uppercase outline-none focus:border-[#db2777] focus:ring-2 focus:ring-pink-200"
                      />
                      <button
                        type="button"
                        onClick={applyPromo}
                        disabled={promoLoading}
                        className="shrink-0 rounded-xl bg-[#db2777] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#9d174d] disabled:opacity-50"
                      >
                        {promoLoading ? "..." : "Apply"}
                      </button>
                    </div>
                  )}
                  {promoError && (
                    <p className="mt-1.5 text-sm text-red-600">{promoError}</p>
                  )}
                  {promoSuccess && !appliedCoupon && (
                    <p className="mt-1.5 text-sm text-emerald-600">{promoSuccess}</p>
                  )}
                </div>

                <div className="mt-4 space-y-2 border-t border-pink-100 pt-4 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>সাবটোটাল</span>
                    <span>{formatBDT(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>ডিসকাউন্ট ({appliedCoupon?.code})</span>
                      <span>−{formatBDT(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>ডেলিভারি চার্জ</span>
                    <span>{formatBDT(SHIPPING_COST)}</span>
                  </div>
                  <div className="flex justify-between border-t border-dashed border-pink-200 pt-3 text-base font-extrabold text-[#db2777]">
                    <span>সর্বমোট</span>
                    <span>{formatBDT(grandTotal)}</span>
                  </div>
                </div>

                <Link
                  href="/cart"
                  className="mt-4 block text-center text-sm font-semibold text-[#db2777] hover:underline"
                >
                  ← কার্টে ফিরে যান
                </Link>
              </div>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
