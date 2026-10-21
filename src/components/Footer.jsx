"use client";

import Link from "next/link";
import { useState } from "react";
import { Facebook, Instagram, Youtube, Music2 } from "lucide-react";

export default function GlobalFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const socials = [
    { Icon: Facebook, label: "Facebook" },
    { Icon: Instagram, label: "Instagram" },
    { Icon: Music2, label: "TikTok" },
    { Icon: Youtube, label: "YouTube" },
  ];

  return (
    <footer className="mt-auto border-t border-rose-900/10 bg-gradient-to-b from-slate-900 to-slate-950 pt-16 pb-8 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 border-b border-slate-800/80 pb-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            <Link
              href="/"
              aria-label="রূপসী Cosmetic"
              className="inline-flex flex-col items-start justify-center leading-none"
            >
              <span className="text-2xl font-bold tracking-wide text-white">
                রূপসী
              </span>
              <span className="-mt-0.5 text-sm font-medium tracking-wider text-rose-400">
                Cosmetic
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-slate-400">
              100% authentic and dermatologist-tested skincare and makeup. Glow
              naturally every day with confidence.
            </p>
            <div className="flex items-center gap-2.5 pt-1">
              {socials.map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800/80 text-slate-300 transition-all duration-300 hover:scale-110 hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-500/30"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="transition-colors hover:text-rose-400">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/shop" className="transition-colors hover:text-rose-400">
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?hotOffer=true"
                  className="transition-colors hover:text-rose-400"
                >
                  Special Offers
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="transition-colors hover:text-rose-400">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Customer Care
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#" className="transition-colors hover:text-rose-400">
                  Help & Support
                </a>
              </li>
              <li>
                <Link href="/track-order" className="transition-colors hover:text-rose-400">
                  Track Order
                </Link>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-rose-400">
                  Shipping & Delivery
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-rose-400">
                  Returns & Refunds
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-rose-400">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-white">
              Stay Glowing
            </h3>
            <p className="mb-4 text-xs leading-relaxed text-slate-400">
              Subscribe for 10% off your first order and beauty tips in your
              inbox.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2.5">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs text-white placeholder-slate-500 transition-colors focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400/40"
              />
              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 py-2.5 text-xs font-semibold text-white shadow-md shadow-rose-900/30 transition-all hover:from-rose-500 hover:to-pink-500 hover:shadow-lg"
              >
                {subscribed ? "Subscribed" : "Subscribe"}
              </button>
            </form>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-6 pt-8 text-xs text-slate-500 md:flex-row">
          <p>&copy; 2026 Rupshi Cosmetic. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <span className="text-slate-600">Secure payments:</span>
            <span className="rounded-md bg-slate-800/80 px-2.5 py-1 font-bold tracking-tight text-pink-400">
              bKash
            </span>
            <span className="rounded-md bg-slate-800/80 px-2.5 py-1 font-bold tracking-tight text-orange-400">
              Nagad
            </span>
            <span className="rounded-md bg-slate-800/80 px-2.5 py-1 font-bold tracking-tight text-blue-400">
              Visa
            </span>
            <span className="rounded-md bg-slate-800/80 px-2.5 py-1 font-bold tracking-tight text-amber-500">
              Mastercard
            </span>
            <span className="rounded-md bg-slate-800/80 px-2.5 py-1 font-semibold text-emerald-400">
              COD
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
