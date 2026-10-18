"use client";

import Link from "next/link";
import { useState } from "react";

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

  return (
    <footer className="mt-auto border-t border-rose-900/10 bg-gradient-to-b from-slate-900 to-slate-950 pt-16 pb-8 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Section */}
        <div className="grid grid-cols-1 gap-10 border-b border-slate-800/80 pb-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Info */}
          <div className="space-y-4 lg:col-span-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-2xl font-bold tracking-wide text-white"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-xs text-white">
                র
              </span>
              রূপসী <span className="text-rose-400">কসমেটিক</span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-slate-400">
              ১০০% অরিজিনাল ও ডার্মাটোলজিস্ট-টেস্টেড স্কিনকেয়ার এবং মেকআপ পণ্যের বিশ্বস্ত ঠিকানা। প্রতিদিন প্রাকৃতিকভাবে উজ্জ্বল ও আত্মবিশ্বাসী থাকুন।
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-2.5 pt-1">
              {[
                { icon: "f", label: "Facebook" },
                { icon: "📸", label: "Instagram" },
                { icon: "🎵", label: "TikTok" },
                { icon: "▶", label: "YouTube" },
              ].map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800/80 text-sm text-slate-300 transition-all duration-300 hover:scale-110 hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-500/30"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              কুইক লিংক
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="transition-colors hover:text-rose-400">
                  আমাদের সম্পর্কে
                </Link>
              </li>
              <li>
                <Link href="/shop" className="transition-colors hover:text-rose-400">
                  সকল প্রোডাক্ট
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?hotOffer=true"
                  className="transition-colors hover:text-rose-400"
                >
                  বিশেষ অফার
                </Link>
              </li>
              <li>
                <Link href="/#reviews" className="transition-colors hover:text-rose-400">
                  গ্রাহকদের মতামত
                </Link>
              </li>
              <li>
                <Link href="/admin" className="transition-colors hover:text-rose-400">
                  অ্যাডমিন প্যানেল
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              কাস্টমার কেয়ার
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#" className="transition-colors hover:text-rose-400">
                  হেল্প ও সাপোর্ট
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-rose-400">
                  অর্ডার ট্র্যাক করুন
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-rose-400">
                  শিপিং ও ডেলিভারি
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-rose-400">
                  রিটার্ন ও রিফান্ড
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-rose-400">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-white">
              গ্লো মে থাকুন
            </h3>
            <p className="mb-4 text-xs leading-relaxed text-slate-400">
              প্রথম অর্ডারে ১০% ছাড় পেতে সাবস্ক্রাইব করুন এবং বিউটি টিপস সরাসরি ইমেইলে পান!
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2.5">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="আপনার ইমেইল দিন"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs text-white placeholder-slate-500 transition-colors focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400/40"
              />
              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 py-2.5 text-xs font-semibold text-white shadow-md shadow-rose-900/30 transition-all hover:from-rose-500 hover:to-pink-500 hover:shadow-lg"
              >
                {subscribed ? "✓ সাবস্ক্রাইব সম্পন্ন!" : "সাবস্ক্রাইব করুন"}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col items-center justify-between gap-6 pt-8 text-xs text-slate-500 md:flex-row">
          <p>&copy; ২০২৬ রূপসী কসমেটিক। সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <span className="text-slate-600">নিরাপদ পেমেন্ট:</span>
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
