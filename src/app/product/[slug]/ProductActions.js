"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

/**
 * Quantity selector + Add-to-cart button for the product detail page.
 * Client island inside the server-rendered /product/[slug] page.
 */
export default function ProductActions({ product }) {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);

  return (
    <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
      {/* Quantity selector */}
      <div className="flex items-center justify-center rounded-full border border-pink-200 bg-white">
        <button
          type="button"
          aria-label="কমান"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="min-h-12 w-12 rounded-full text-xl font-bold text-[#ec4899] transition hover:bg-pink-50"
        >
          −
        </button>
        <span className="w-10 text-center text-lg font-bold text-gray-800">{qty}</span>
        <button
          type="button"
          aria-label="বাড়ান"
          onClick={() => setQty((q) => q + 1)}
          className="min-h-12 w-12 rounded-full text-xl font-bold text-[#ec4899] transition hover:bg-pink-50"
        >
          +
        </button>
      </div>

      {/* Add to cart */}
      <button
        type="button"
        disabled={!product.inStock}
        onClick={() => {
          for (let i = 0; i < qty; i++) addToCart(product);
        }}
        className={`min-h-12 flex-1 rounded-full px-8 py-3 text-base font-bold text-white shadow-md transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:bg-gray-300 ${
          product.inStock ? "bg-[#ec4899] hover:bg-[#db2777]" : ""
        }`}
      >
        🛒 কার্টে যোগ করো
      </button>
    </div>
  );
}
