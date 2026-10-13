"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

/**
 * Global navbar with logo, Bengali links and a cart icon with live item-count badge.
 */
export default function Navbar({ active = "home" }) {
  const { totalItems } = useCart();

  const linkClass = (key) =>
    `transition-colors hover:text-[#db2777] ${
      active === key ? "text-[#db2777]" : "text-gray-700"
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-2xl font-bold text-[#db2777]">
          রূপসী
        </Link>

        <div className="flex items-center gap-6 text-base font-medium">
          <Link href="/" className={linkClass("home")}>
            হোম
          </Link>
          <Link href="/shop" className={linkClass("shop")}>
            দোকান
          </Link>

          {/* Cart icon with badge → /cart */}
          <Link
            href="/cart"
            aria-label="কার্ট"
            className={`relative transition-colors hover:text-[#db2777] ${
              active === "cart" ? "text-[#db2777]" : "text-gray-700"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>

            {totalItems > 0 && (
              <span className="absolute -right-2.5 -top-2.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[#db2777] px-1 text-xs font-bold text-white">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
