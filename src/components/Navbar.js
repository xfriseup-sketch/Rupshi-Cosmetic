"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

/**
 * Premium sticky navbar — glassmorphism + soft rose accents
 */
export default function Navbar({ active = "home" }) {
  const { totalItems } = useCart();

  const linkClass = (key) =>
    `relative px-1 py-1 text-sm font-medium tracking-wide transition-all duration-300 ${
      active === key
        ? "text-rose-600 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-rose-500"
        : "text-slate-600 hover:text-rose-600"
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-rose-100/60 bg-white/80 backdrop-blur-xl shadow-[0_1px_12px_-4px_rgba(219,39,119,0.08)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2 text-2xl font-bold tracking-tight text-rose-600 transition-transform duration-300 hover:scale-[1.02]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-sm text-white shadow-md shadow-rose-200">
            র
          </span>
          <span>
            রূপসী
            <span className="ml-1 text-sm font-medium text-rose-400 opacity-80 group-hover:opacity-100">
              Cosmetic
            </span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-5 sm:gap-7">
          <Link href="/" className={linkClass("home")}>
            হোম
          </Link>
          <Link href="/shop" className={linkClass("shop")}>
            দোকান
          </Link>
          <Link href="/admin" className={linkClass("admin")}>
            অ্যাডমিন
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            aria-label="কার্ট"
            className={`relative rounded-full p-2 transition-all duration-300 hover:bg-rose-50 ${
              active === "cart" ? "text-rose-600" : "text-slate-600 hover:text-rose-600"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>

            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-600 px-1.5 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
