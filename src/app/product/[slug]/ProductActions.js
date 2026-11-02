"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

/**
 * Quantity selector + Add-to-cart button for the product detail page.
 * Client island inside the server-rendered /product/[slug] page.
 */
export default function ProductActions({ product }) {
  const { addToCart } = useCart();
  const stock = Math.max(0, Math.floor(Number(product.stock) || 0));
  const inStock = stock > 0;
  const [qty, setQty] = useState(1);

  return (
    <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
      {inStock && stock < 10 && (
        <p className="w-full text-sm font-medium text-amber-600 sm:hidden">মাত্র {stock} টি বাকি</p>
      )}
      <div className="flex items-center justify-center rounded-full border border-pink-200 bg-white">
        <button
          type="button"
          aria-label="কমান"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          disabled={!inStock}
          className="min-h-12 w-12 rounded-full text-xl font-bold text-[#ec4899] transition hover:bg-pink-50 disabled:text-gray-300"
        >
          −
        </button>
        <span className="w-10 text-center text-lg font-bold text-gray-800">{qty}</span>
        <button
          type="button"
          aria-label="বাড়ান"
          onClick={() => setQty((q) => Math.min(stock, q + 1))}
          disabled={!inStock || qty >= stock}
          className="min-h-12 w-12 rounded-full text-xl font-bold text-[#ec4899] transition hover:bg-pink-50 disabled:text-gray-300"
        >
          +
        </button>
      </div>

      <button
        type="button"
        disabled={!inStock}
        onClick={() => addToCart({ ...product, stock }, qty)}
        className={`min-h-12 flex-1 rounded-full px-8 py-3 text-base font-bold text-white shadow-md transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:bg-gray-300 ${
          inStock ? "bg-[#ec4899] hover:bg-[#db2777]" : ""
        }`}
      >
        {inStock ? "কার্টে যোগ করো" : "স্টক শেষ"}
      </button>
      {inStock && stock < 10 && (
        <p className="hidden text-sm font-medium text-amber-600 sm:block">মাত্র {stock} টি বাকি</p>
      )}
    </div>
  );
}
