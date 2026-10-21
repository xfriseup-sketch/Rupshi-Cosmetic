"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useCart } from "@/context/CartContext";
import SearchBar from "@/components/SearchBar";

/**
 * Premium sticky navbar — glassmorphism + soft rose accents
 */
export default function Navbar({ active = "home" }) {
  const { totalItems } = useCart();
  const [mobileSearch, setMobileSearch] = useState(false);

  const linkClass = (key) =>
    `relative px-1 py-1 text-sm font-medium tracking-wide transition-all duration-300 ${
      active === key
        ? "text-rose-600 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-rose-500"
        : "text-slate-600 hover:text-rose-600"
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-rose-100/60 bg-white/80 backdrop-blur-xl shadow-[0_1px_12px_-4px_rgba(219,39,119,0.08)]">
      <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            aria-label="রূপসী Cosmetic"
            className="group flex shrink-0 flex-col items-start justify-center leading-none transition-transform duration-300 hover:scale-[1.02]"
          >
            <span className="text-2xl font-bold tracking-tight text-rose-600">
              রূপসী
            </span>
            <span className="-mt-0.5 text-sm font-medium tracking-wider text-rose-400 opacity-80 group-hover:opacity-100">
              Cosmetic
            </span>
          </Link>

          <div className="hidden min-w-0 flex-1 md:block md:max-w-md lg:max-w-lg">
            <SearchBar />
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/" className={`${linkClass("home")} hidden sm:inline`}>
              হোম
            </Link>
            <Link href="/shop" className={linkClass("shop")}>
              দোকান
            </Link>
            <Link href="/track-order" className={`${linkClass("track")} hidden lg:inline`}>
              ট্র্যাক
            </Link>
            <Link href="/admin" className={`${linkClass("admin")} hidden lg:inline`}>
              অ্যাডমিন
            </Link>

            <button
              type="button"
              className="rounded-full p-2 text-slate-600 hover:bg-rose-50 hover:text-rose-600 md:hidden"
              aria-label="খুঁজুন"
              aria-expanded={mobileSearch}
              onClick={() => setMobileSearch((open) => !open)}
            >
              <Search size={18} />
            </button>

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

        {mobileSearch && (
          <div className="mt-2 md:hidden">
            <SearchBar autoFocus />
          </div>
        )}
      </div>
    </nav>
  );
}
