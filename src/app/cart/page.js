"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

// Category badge colors & Bengali labels (matching shop page)
const categoryMeta = {
  Skincare: { bn: "স্কিনকেয়ার", badge: "bg-pink-100 text-[#db2777]" },
  Makeup: { bn: "মেকআপ", badge: "bg-rose-100 text-rose-700" },
  Haircare: { bn: "হেয়ারকেয়ার", badge: "bg-fuchsia-100 text-fuchsia-700" },
  Fragrance: { bn: "ফ্র্যাগ্রেন্স", badge: "bg-purple-100 text-purple-700" },
};

const SHIPPING_COST = 60; // Fixed shipping cost in BDT

const formatBDT = (amount) => `৳${new Intl.NumberFormat("bn-BD").format(amount)}`;

export default function CartPage() {
  const {
    items,
    totalItems,
    totalPrice,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  // Avoid hydration mismatch: only render cart contents after mount (localStorage read)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const grandTotal = totalPrice + (items.length > 0 ? SHIPPING_COST : 0);

  return (
    <main className="min-h-screen bg-pink-50">
      {/* Page Header */}
      <section className="bg-gradient-to-br from-pink-100 via-pink-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-10 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            আপনার <span className="text-[#db2777]">কার্ট</span>
          </h1>
          <p className="mt-2 text-gray-600">
            পছন্দের পণ্যগুলো যাচাই করে অর্ডার সম্পন্ন করুন
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        {!mounted ? (
          /* Loading state while reading localStorage */
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-pink-200 border-t-[#db2777]" />
            <p className="text-xl font-semibold text-[#db2777]">লোড হচ্ছে...</p>
          </div>
        ) : items.length === 0 ? (
          /* Empty cart state */
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <span className="text-6xl">🛒</span>
            <p className="text-2xl font-bold text-gray-800">
              আপনার কার্ট খালি
            </p>
            <p className="text-sm text-gray-500">
              এখনও কোনো পণ্য যোগ করা হয়নি। চলুন কেনাকাটা শুরু করি!
            </p>
            <Link
              href="/shop"
              className="mt-4 rounded-full bg-[#db2777] px-8 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-[#9d174d]"
            >
              দোকানে যাও
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="space-y-4 lg:col-span-2">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  মোট {totalItems}টি পণ্য
                </h2>
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-sm font-semibold text-gray-500 underline-offset-2 transition-colors hover:text-[#db2777] hover:underline"
                >
                  কার্ট খালি করো
                </button>
              </div>

              {items.map((item) => {
                const meta = categoryMeta[item.category] ?? {
                  bn: item.category,
                  badge: "bg-pink-100 text-[#db2777]",
                };

                return (
                  <article
                    key={item._id}
                    className="flex flex-col gap-4 rounded-2xl border border-pink-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
                  >
                    {/* Product image */}
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-pink-100">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="96px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-3xl">
                          💄
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <span
                        className={`rounded-full px-3 py-0.5 text-xs font-semibold ${meta.badge}`}
                      >
                        {meta.bn}
                      </span>
                      <h3 className="mt-1 text-lg font-bold text-gray-900">
                        {item.name}
                      </h3>
                      <p className="text-sm font-semibold text-[#db2777]">
                        {formatBDT(item.price)}{" "}
                        <span className="text-xs font-normal text-gray-500">
                          / প্রতিটি
                        </span>
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center rounded-full border border-pink-200 bg-pink-50">
                        <button
                          type="button"
                          aria-label="কমান"
                          onClick={() =>
                            updateQuantity(item._id, item.quantity - 1)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold text-[#db2777] transition-colors hover:bg-pink-200"
                        >
                          −
                        </button>
                        <span className="w-10 text-center font-bold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="বাড়ান"
                          onClick={() =>
                            updateQuantity(item._id, item.quantity + 1)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold text-[#db2777] transition-colors hover:bg-pink-200"
                        >
                          +
                        </button>
                      </div>

                      <p className="hidden w-24 text-right text-lg font-extrabold text-gray-900 sm:block">
                        {formatBDT(item.price * item.quantity)}
                      </p>

                      {/* Remove button */}
                      <button
                        type="button"
                        aria-label="সরান"
                        onClick={() => removeFromCart(item._id)}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-red-100 hover:text-red-600"
                      >
                        🗑️
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Order Summary */}
            <aside className="h-fit rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900">
                অর্ডার সারাংশ
              </h2>

              <div className="mt-4 space-y-3 text-base">
                <div className="flex justify-between text-gray-600">
                  <span>সাবটোটাল ({totalItems}টি পণ্য)</span>
                  <span className="font-semibold text-gray-900">
                    {formatBDT(totalPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>ডেলিভারি চার্জ</span>
                  <span className="font-semibold text-gray-900">
                    {formatBDT(SHIPPING_COST)}
                  </span>
                </div>
                <div className="border-t border-dashed border-pink-200 pt-3">
                  <div className="flex justify-between text-lg font-extrabold">
                    <span>সর্বমোট</span>
                    <span className="text-[#db2777]">
                      {formatBDT(grandTotal)}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href="/checkout"
                className="mt-6 block rounded-full bg-[#db2777] px-6 py-3 text-center text-lg font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] hover:bg-[#9d174d]"
              >
                অর্ডার করুন
              </Link>

              <Link
                href="/shop"
                className="mt-3 block text-center text-sm font-semibold text-[#db2777] transition-colors hover:text-[#9d174d]"
              >
                আরও কেনাকাটা করো →
              </Link>
            </aside>
          </div>
        )}
      </section>


    </main>
  );
}
