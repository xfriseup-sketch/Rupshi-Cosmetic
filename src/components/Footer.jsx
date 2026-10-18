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
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-rose-900/20 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="text-2xl font-bold text-white tracking-wide inline-block">
              রূপসী <span className="text-rose-400">কসমেটিক</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              ১০০% অরিজিনাল ও ডার্মাটোলজিস্ট-টেস্টেড স্কিনকেয়ার এবং মেকআপ পণ্যের বিশ্বস্ত ঠিকানা। প্রতিদিন প্রাকৃতিকভাবে উজ্জ্বল ও আত্মবিশ্বাসী থাকুন।
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
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
                  className="w-9 h-9 rounded-full bg-slate-800 text-slate-300 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center text-sm"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4 tracking-wider">কুইক লিংক</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/" className="hover:text-rose-400 transition-colors">আমাদের সম্পর্কে</Link></li>
              <li><Link href="/shop" className="hover:text-rose-400 transition-colors">সকল প্রোডাক্ট</Link></li>
              <li><Link href="/shop?hotOffer=true" className="hover:text-rose-400 transition-colors">বিশেষ অফার</Link></li>
              <li><Link href="/#reviews" className="hover:text-rose-400 transition-colors">গ্রাহকদের মতামত</Link></li>
              <li><Link href="/admin" className="hover:text-rose-400 transition-colors">অ্যাডমিন প্যানেল</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4 tracking-wider">কাস্টমার কেয়ার</h3>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="hover:text-rose-400 transition-colors">হেল্প ও সাপোর্ট</a></li>
              <li><a href="#" className="hover:text-rose-400 transition-colors">অর্ডার ট্র্যাক করুন</a></li>
              <li><a href="#" className="hover:text-rose-400 transition-colors">শিপিং ও ডেলিভারি</a></li>
              <li><a href="#" className="hover:text-rose-400 transition-colors">রিটার্ন ও রিফান্ড</a></li>
              <li><a href="#" className="hover:text-rose-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold text-base mb-2 tracking-wider">গ্লো মে থাকুন</h3>
            <p className="text-slate-400 text-xs mb-4">
              প্রথম অর্ডারে ১০% ছাড় পেতে সাবস্ক্রাইব করুন এবং বিউটি টিপস সরাসরি ইমেইলে পান!
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="আপনার ইমেইল দিন"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-400 transition-colors"
              />
              <button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs py-2.5 rounded-xl transition-colors shadow-md"
              >
                {subscribed ? "✓ সাবস্ক্রাইব সম্পন্ন!" : "সাবস্ক্রাইব করুন"}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <p>&copy; ২০২৬ রূপসী কসমেটিক। সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <span className="text-slate-500">নিরাপদ পেমেন্ট:</span>
            <span className="bg-slate-800 px-2.5 py-1 rounded text-pink-400 font-bold tracking-tight">bKash</span>
            <span className="bg-slate-800 px-2.5 py-1 rounded text-orange-400 font-bold tracking-tight">Nagad</span>
            <span className="bg-slate-800 px-2.5 py-1 rounded text-blue-400 font-bold tracking-tight">Visa</span>
            <span className="bg-slate-800 px-2.5 py-1 rounded text-amber-500 font-bold tracking-tight">Mastercard</span>
            <span className="bg-slate-800 px-2.5 py-1 rounded text-emerald-400 font-semibold">COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
