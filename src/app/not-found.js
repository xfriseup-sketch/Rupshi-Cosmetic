"use client"; 

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Home, Sparkles, ArrowRight } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);

  // সার্চ হ্যান্ডলার
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // মিরর ক্লিক অ্যানিমেশন
  const handleMirrorClick = () => {
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 700);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF5F7] via-white to-rose-50/50 flex items-center justify-center p-4 sm:p-6 lg:p-8 select-none font-sans">
      
      {/* মেইন কন্টেইনার */}
      <section className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center text-center relative py-6 sm:py-10">
        
        {/* ব্যাকগ্রাউন্ড গ্লো ইফেক্ট (Rose-600 tinted) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-rose-200/40 rounded-full blur-3xl -z-10 animate-pulse pointer-events-none"></div>
        <div className="absolute -top-10 right-0 w-36 h-36 bg-rose-400/20 rounded-full blur-2xl -z-10 pointer-events-none"></div>

        {/* ফ্লোটিং গ্রাফিক্স সেকশন */}
        <div className="relative w-full max-w-md h-48 sm:h-60 flex items-center justify-center mb-4">
          
          {/* বিগ 404 ওয়াটারমার্ক (Now using Rose-600 gradient) */}
          <span className="text-7xl sm:text-9xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-rose-300/40 via-rose-600/30 to-rose-300/40 select-none">
            404
          </span>

          {/* সেন্টার মিরর / মেকআপ ভিজ্যুয়াল */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              onClick={handleMirrorClick}
              className={`relative cursor-pointer group transition-transform duration-300 ${isSpinning ? 'animate-spin' : ''}`}
              title="ক্লিক করুন!"
            >
              <div className="bg-white/90 p-4 sm:p-5 rounded-full shadow-lg border border-rose-100 backdrop-blur-md transform group-hover:scale-110 group-hover:rotate-6 transition duration-300">
                {/* Compact Hand Mirror SVG (Stroke color changed to rose-600) */}
                <svg className="w-16 h-16 sm:w-20 sm:h-20 text-rose-600" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="32" cy="28" r="22" stroke="currentColor" strokeWidth="3" fill="#FFF5F7"/>
                  <circle cx="32" cy="28" r="17" stroke="#e11d48" strokeWidth="2" fill="#FFFFFF"/>
                  <rect x="30" y="50" width="4" height="11" rx="2" fill="currentColor"/>
                  {/* Confused Expressive Face */}
                  <circle cx="26" cy="25" r="2" fill="#831843"/>
                  <circle cx="38" cy="25" r="2" fill="#831843"/>
                  <ellipse cx="32" cy="32" rx="2.5" ry="3.5" fill="#e11d48"/>
                  <circle cx="22" cy="28" r="2" fill="#fda4af" opacity="0.6"/>
                  <circle cx="42" cy="28" r="2" fill="#fda4af" opacity="0.6"/>
                </svg>
              </div>
              {/* Floating Question Sparks */}
              <span className="absolute -top-1 left-1 text-rose-600 font-bold text-lg animate-bounce">?</span>
              <span className="absolute -top-3 right-2 text-rose-400 font-bold text-sm animate-bounce" style={{ animationDelay: '0.3s' }}>?</span>
            </div>
          </div>

          {/* Left Item: Lipstick */}
          <div className="absolute left-2 sm:left-6 top-4 sm:top-8 animate-[floatSlow_4.5s_ease-in-out_infinite]">
            <div className="bg-white p-2.5 sm:p-3 rounded-2xl shadow-md border border-rose-100 -rotate-12 hover:rotate-0 transition duration-300 flex items-center gap-1">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12v9a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-9"/>
                <path d="M9 12V7a3 3 0 0 1 6 0v5"/>
                <path d="M10 3l4 2v2h-4z" fill="#e11d48"/>
              </svg>
              <span className="text-xs">✨</span>
            </div>
          </div>

          {/* Right Item: Serum Bottle */}
          <div className="absolute right-2 sm:right-6 bottom-4 sm:bottom-8 animate-[floatReverse_5s_ease-in-out_infinite]">
            <div className="bg-white p-2.5 sm:p-3 rounded-2xl shadow-md border border-rose-100 rotate-12 hover:rotate-0 transition duration-300 flex items-center gap-1">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 2h4v3h-4z"/>
                <path d="M8 5h8v2H8z"/>
                <rect x="6" y="7" width="12" height="14" rx="3" fill="#FFF5F7"/>
                <path d="M12 11v5"/>
              </svg>
              <span className="text-xs">💧</span>
            </div>
          </div>

        </div>

        {/* Bengali Title (Changed to Rose-600) */}
        <h1 className="text-2xl sm:text-4xl font-bold text-rose-600 mb-2 tracking-tight">
          Oops! Your beauty page went missing?
        </h1>

        {/* Friendly Description */}
        <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto leading-relaxed mb-6">
          আপনি যে পেজটি খুঁজছেন, সেটি খুঁজে পাওয়া যাচ্ছে না। তবে আপনার পছন্দের মেকআপ, স্কিনকেয়ার ও বিউটি প্রোডাক্টের জগৎ আপনার জন্য অপেক্ষা করছে।
        </p>

        {/* Quick Search Input (Focus ring updated to Rose-600) */}
        <div className="w-full max-w-sm mb-6 relative">
          <form onSubmit={handleSearch} className="relative">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="পছন্দের প্রোডাক্ট খুঁজুন... (যেমন: Serum, Lipstick)" 
              className="w-full bg-white text-slate-800 placeholder-slate-400 pl-10 pr-12 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm border border-rose-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-600/40 focus:border-rose-600 transition-all"
            />
            <Search size={16} className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-400" />
            <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-rose-600 hover:bg-rose-700 text-white p-1.5 rounded-full transition">
              <ArrowRight size={14} className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Action Buttons (Primary Button now solid Rose-600) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md mb-8">
          {/* Primary CTA */}
          <Link href="/" className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200">
            <Home size={16} className="w-4 h-4 text-rose-100" />
            <span>হোমে ফিরে যান</span>
          </Link>

          {/* Secondary CTA */}
          <Link href="/shop" className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-rose-50 text-rose-600 text-sm font-semibold rounded-full border border-rose-200 shadow-sm hover:border-rose-400 hover:-translate-y-0.5 transition-all duration-200">
            <Sparkles size={16} className="w-4 h-4 text-rose-500" />
            <span>দোকানে যান</span>
          </Link>
        </div>

        {/* Fast Category Chips (Hover effect updated to Rose-600 background) */}
        <div className="w-full max-w-md pt-4 border-t border-rose-100">
          <p className="text-xs font-medium text-slate-500 mb-3">জনপ্রিয় ক্যাটাগরিগুলো ব্রাউজ করুন:</p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <Link href="/shop?category=skincare" className="px-3 py-1.5 bg-white hover:bg-rose-600 hover:text-white text-slate-700 rounded-full border border-rose-100 shadow-xs transition duration-200">
              🧴 স্কিন কেয়ার
            </Link>
            <Link href="/shop?category=makeup" className="px-3 py-1.5 bg-white hover:bg-rose-600 hover:text-white text-slate-700 rounded-full border border-rose-100 shadow-xs transition duration-200">
              💄 মেকআপ
            </Link>
            <Link href="/shop?category=haircare" className="px-3 py-1.5 bg-white hover:bg-rose-600 hover:text-white text-slate-700 rounded-full border border-rose-100 shadow-xs transition duration-200">
              ✨ হেয়ারকেয়ার
            </Link>
            <Link href="/shop?category=combo" className="px-3 py-1.5 bg-white hover:bg-rose-600 hover:text-white text-slate-700 rounded-full border border-rose-100 shadow-xs transition duration-200">
              🎁 অফার কম্বো
            </Link>
          </div>
        </div>

      </section>
    </div>
  );
}
