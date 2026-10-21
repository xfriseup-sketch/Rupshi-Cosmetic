"use client"; // 'use client' লাগবে কারণ আমরা useState এবং ইন্টারঅ্যাক্টিভ এলিমেন্ট ব্যবহার করছি

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ArrowLeft, Sparkles, ShoppingBag, Heart } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="relative flex min-h-[90vh] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-rose-50 via-white to-pink-50 px-4 py-12">
      
      {/* Decorative Animated Blobs (Background Elements) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-blob absolute -left-20 top-20 h-72 w-72 rounded-full bg-rose-200 mix-blend-multiply filter blur-xl opacity-70"></div>
        <div className="animate-blob animation-delay-2000 absolute -right-20 top-40 h-72 w-72 rounded-full bg-pink-200 mix-blend-multiply filter blur-xl opacity-70"></div>
        <div className="animate-blob animation-delay-4000 absolute bottom-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-orange-100 mix-blend-multiply filter blur-xl opacity-70"></div>
      </div>

      {/* Main Content Card */}
      <div className="relative z-10 max-w-lg w-full text-center">
        
        {/* Icon / Illustration Area */}
        <div className="mb-6 inline-flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-rose-100">
          <Sparkles className="h-10 w-10 text-rose-500 animate-pulse" />
        </div>

        {/* Error Code */}
        <h1 className="text-8xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-500 mb-2 select-none">
          404
        </h1>

        {/* Headline */}
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">
          ওহো! পৃষ্ঠাটি পাওয়া যায়নি
        </h2>

        {/* Subtext */}
        <p className="text-slate-600 mb-8 leading-relaxed">
          আপনি সম্ভবত ভুল লিংকে ক্লিক করেছেন অথবা পৃষ্ঠাটি স্থানান্তরিত হয়েছে। 
          চিন্তা করবেন না, নিচের অপশনগুলো ব্যবহার করে আমাদের সাথে আবার যুক্ত হোন।
        </p>

        {/* Smart Search Box */}
        <form onSubmit={handleSearch} className="relative mb-8 group">
          <input
            type="text"
            placeholder="আপনার পছন্দের পণ্য খুঁজুন... (যেমন: Serum, Lipstick)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-rose-100 focus:border-rose-500 focus:ring-4 focus:ring-rose-100 outline-none text-lg shadow-sm transition-all bg-white/90 backdrop-blur-md"
          />
          <button 
            type="submit"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500 hover:text-rose-700 transition-colors"
            aria-label="Search"
          >
            <Search size={22} />
          </button>
        </form>

        {/* Quick Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          
          {/* Primary: Go Home */}
          <Link 
            href="/" 
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-rose-600 text-white font-semibold rounded-full shadow-lg hover:bg-rose-700 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
          >
            <ArrowLeft size={18} />
            হোমপেজে ফিরুন
          </Link>

          {/* Secondary: Shop Now */}
          <Link 
            href="/shop" 
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-rose-600 border-2 border-rose-200 font-semibold rounded-full shadow-sm hover:border-rose-400 hover:bg-rose-50 transform hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
          >
            <ShoppingBag size={18} />
            দোকানে যান
          </Link>
        </div>

        {/* Footer Hint */}
        <div className="mt-10 text-sm text-slate-400">
          <p>সাহায্যের জন্য? <Link href="/contact" className="text-rose-500 hover:underline font-medium">যোগাযোগ করুন</Link></p>
        </div>

      </div>
      
      {/* CSS for Blob Animation (Add this in globals.css or use Tailwind arbitrary values if supported) */}
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
