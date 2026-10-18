import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "রূপসী কসমেটিক্স | Rupshi Cosmetics",
  description: "আপনার সৌন্দর্যের যত্নে বিশ্বস্ত নাম। স্কিনকেয়ার, মেকআপ ও হেয়ারকেয়ারের সেরা কালেকশন।",
};

// --- Global Premium Footer Component (Exact Design Match) ---
function GlobalFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-rose-900/20 mt-auto font-body">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section: Grid Links & Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Column 1: Brand Info (Spans 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <a href="/" className="font-serif-title text-2xl font-bold text-white tracking-wide flex items-center gap-2">
              <span className="text-rose-400">✨</span> 
              <span>রূপসী <span className="text-rose-400">Beauty</span></span>
            </a>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              ১০০% অর্গানিক ও ডার্মাটোলজিস্ট অনুমোদিত স্কিনকেয়ার রেঞ্জের সাথে আপনার সৌন্দর্যের যত্ন নিন। প্রতিদিন স্বাভাবিকভাবেই আত্মবিশ্বাসী হয়ে উঠুন।
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-full bg-slate-800 text-slate-300 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center text-lg">
                f
              </a>
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-full bg-slate-800 text-slate-300 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center text-lg">
                ig
              </a>
              <a href="#" aria-label="TikTok" className="w-9 h-9 rounded-full bg-slate-800 text-slate-300 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center text-lg">
                tk
              </a>
              <a href="#" aria-label="YouTube" className="w-9 h-9 rounded-full bg-slate-800 text-slate-300 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center text-lg">
                yt
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4 tracking-wider uppercase">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              <li><a href="/about" className="hover:text-rose-400 transition-colors">আমাদের সম্পর্কে</a></li>
              <li><a href="/shop" className="hover:text-rose-400 transition-colors">সব প্রোডাক্ট দেখুন</a></li>
              <li><a href="/offers" className="hover:text-rose-400 transition-colors">বিশেষ অফার</a></li>
              <li><a href="/reviews" className="hover:text-rose-400 transition-colors">গ্রাহকদের মতামত</a></li>
              <li><a href="/contact" className="hover:text-rose-400 transition-colors">যোগাযোগ</a></li>
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4 tracking-wider uppercase">Customer Care</h3>
            <ul className="space-y-2.5 text-sm">
              <li><a href="/help" className="hover:text-rose-400 transition-colors">সহায়তা ও সাপোর্ট</a></li>
              <li><a href="/track-order" className="hover:text-rose-400 transition-colors">অর্ডার ট্র্যাকিং</a></li>
              <li><a href="/shipping" className="hover:text-rose-400 transition-colors">শিপিং ও ডেলিভারি</a></li>
              <li><a href="/returns" className="hover:text-rose-400 transition-colors">রিটার্ন ও রিফান্ড</a></li>
              <li><a href="/terms" className="hover:text-rose-400 transition-colors">নিয়ম ও শর্তাবলী</a></li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="text-white font-semibold text-base mb-2 tracking-wider uppercase">Stay In The Glow</h3>
            <p className="text-slate-400 text-xs mb-4">
              প্রথম অর্ডারে ১০% ছাড় পেতে এবং এক্সক্লুসিভ বিউটি টিপস পাওয়ার জন্য সাবস্ক্রাইব করুন!
            </p>
            <form className="space-y-2" onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="আপনার ইমেইল ঠিকানা" 
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-400 transition-colors"
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs py-2.5 rounded-xl transition-colors shadow-md"
              >
                সাবস্ক্রাইব করুন
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Section: Payments & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          
          {/* Copyright */}
          <p>&copy; {new Date().getFullYear()} রূপসী বিউটি। সকল স্বত্ত্ব সংরক্ষিত।</p>

          {/* Payment Icons / Badges */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <span className="text-slate-500 mr-1">নিরাপদ পেমেন্ট:</span>
            <span className="bg-slate-800 px-2.5 py-1 rounded text-pink-400 font-bold tracking-tight border border-pink-900/30">bKash</span>
            <span className="bg-slate-800 px-2.5 py-1 rounded text-orange-400 font-bold tracking-tight border border-orange-900/30">Nagad</span>
            <span className="bg-slate-800 px-2.5 py-1 rounded text-blue-400 font-bold tracking-tight border border-blue-900/30">Visa</span>
            <span className="bg-slate-800 px-2.5 py-1 rounded text-amber-500 font-bold tracking-tight border border-amber-900/30">MasterCard</span>
            <span className="bg-slate-800 px-2.5 py-1 rounded text-emerald-400 font-semibold border border-emerald-900/30">COD</span>
          </div>

        </div>

      </div>
    </footer>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      {/* min-h-screen flex flex-col ensures footer sticks to bottom even if content is short */}
      <body className={`${inter.className} min-h-screen flex flex-col bg-white`}>
        
        {/* Main Content Area - This grows to push footer down */}
        <div className="flex-grow">
          {children}
        </div>
        
        {/* Global Footer - Appears on ALL pages automatically */}
        <GlobalFooter />
        
      </body>
    </html>
  );
}
