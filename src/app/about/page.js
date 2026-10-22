import Link from 'next/link';
import { Heart, Star, Award, Users } from 'lucide-react';

export const metadata = {
  title: 'About Us | Rupshi Cosmetics',
  description: 'Know the story behind Rupshi Cosmetics and our mission to empower beauty.',
};

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">
          আমাদের <span className="text-rose-600">গল্প</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          রূপশী শুধুমাত্র একটি ব্র্যান্ড নয়, এটি প্রতিটি নারীর আত্মবিশ্বাসকে জাগিয়ে তোলার একটি প্রচেষ্টা। 
          আমরা বিশ্বাস করি, সত্যিকারের সৌন্দর্য আসে যত্ন এবং ভালো মানের পণ্য থেকে।
        </p>
      </div>

      {/* Values Grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-rose-100 text-center hover:shadow-md transition-shadow">
          <div className="inline-block p-4 bg-rose-50 rounded-full text-rose-600 mb-4">
            <Award size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">১০০% অরিজিনাল</h3>
          <p className="text-slate-600 text-sm">
            আমরা কেবলমাত্র বিশ্বস্ত ব্র্যান্ডের অথেনটিক পণ্য সরবরাহ করি। কোনো নকল বা বাজে মানের পণ্য আমাদের কাছে স্থান পায় না।
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-rose-100 text-center hover:shadow-md transition-shadow">
          <div className="inline-block p-4 bg-rose-50 rounded-full text-rose-600 mb-4">
            <Heart size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">গ্রাহককেन्द्रিক</h3>
          <p className="text-slate-600 text-sm">
            আপনার সন্তুষ্টিই আমাদের প্রধান লক্ষ্য। যেকোনো সমস্যায় আমরা দ্রুত সমাধান প্রদানে প্রতিশ্রুতিবদ্ধ।
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-rose-100 text-center hover:shadow-md transition-shadow">
          <div className="inline-block p-4 bg-rose-50 rounded-full text-rose-600 mb-4">
            <Users size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">দ্রুত ডেলিভারি</h3>
          <p className="text-slate-600 text-sm">
            বাংলাদেশের যেকোনো প্রান্তে দ্রুততম সময়ে পণ্য পৌঁছে দেওয়ার জন্য আমরা সেরা কুরিয়ার পার্টনারদের সাথে কাজ করি।
          </p>
        </div>

      </div>

      {/* Story Section */}
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-rose-100">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Star className="text-yellow-400 fill-yellow-400" /> কেন "রূপশী"?
        </h2>
        <div className="prose prose-slate max-w-none text-slate-700 space-y-4">
          <p>
            "রূপ" মানে সৌন্দর্য, আর "শী" মানে সেই সৌন্দর্যের ধারা। আমাদের নাম থেকেই বোঝা যায়, আমরা চাই প্রতিটি নারী তার নিজস্ব সৌন্দর্যের ধারাটিকে বজায় রাখুক এবং উজ্জ্বল করুক।
          </p>
          <p>
            আজকের ব্যস্ত জীবনে নিজের যত্ন নেওয়া অনেকের পক্ষেই সম্ভব হয়ে ওঠে না। তাই আমরা নিয়ে এসেছি স্কিনকেয়ার, মেকআপ এবং হেয়ারকেয়ারের সেরা সব কিছু—এক জায়গায়, সাশ্রয়ী দামে।
          </p>
          <p>
            আমাদের লক্ষ্য হলো, বাংলাদেশের প্রতিটি নারী যেন বিশ্বমানের বিউটি প্রোডাক্ট সহজেই কিনতে পারে। আমরা বিশ্বাস করি, যখন আপনি সুন্দর বোধ করেন, তখন আপনি আরও বেশি আত্মবিশ্বাসী হন।
          </p>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-100 text-center">
          <p className="text-lg font-semibold text-rose-600">ধন্যবাদ, আমাদের সাথে থাকার জন্য!</p>
          <Link href="/shop" className="inline-block mt-4 px-8 py-3 bg-rose-600 text-white font-bold rounded-full hover:bg-rose-700 transition-all shadow-md">
            আমাদের কালেকশন দেখুন
          </Link>
        </div>
      </div>

    </div>
  );
}
