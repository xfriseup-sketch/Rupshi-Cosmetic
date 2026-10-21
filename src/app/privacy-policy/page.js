import Link from 'next/link';
import { ShieldCheck, Lock, Eye } from 'lucide-react'; // Icons for visual appeal

export const metadata = {
  title: 'Privacy Policy | Rupshi Cosmetics',
  description: 'Learn how we protect your personal information at Rupshi Cosmetics.',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Container with Glass Effect */}
      <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-8 md:p-10 border-b border-rose-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-rose-100 rounded-full text-rose-600">
              <ShieldCheck size={24} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
              গোপনীয়তা নীতিমালা
            </h1>
          </div>
          <p className="text-sm text-slate-500 font-medium">Last Updated: October 21, 2026</p>
        </div>

        {/* Content Body */}
        <div className="p-8 md:p-10 space-y-8 text-slate-700 leading-relaxed">
          
          {/* Intro */}
          <section>
            <p className="text-lg text-slate-600 italic border-l-4 border-rose-300 pl-4">
              রূপশী কসমেটিক্স ("আমরা", "আমাদের") আপনার তথ্যের গোপনীয়তার প্রতি চরম শ্রদ্ধাশীল। 
              এই নীতিমালায় আমরা ব্যাখ্যা করেছি কিভাবে আপনার তথ্য সংগ্রহ, ব্যবহার এবং সুরক্ষিত রাখা হয়।
            </p>
          </section>

          {/* Section 1: Data Collection */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-rose-600 flex items-center gap-2">
              <Lock size={18} /> ১. তথ্য সংগ্রহ (Information We Collect)
            </h2>
            <ul className="list-disc list-inside space-y-2 text-base ml-2 marker:text-rose-400">
              <li><strong>ব্যক্তিগত তথ্য:</strong> নাম, ঠিকানা, ফোন নম্বর, ইমেইল (অর্ডার করার সময়)।</li>
              <li><strong>পেমেন্ট তথ্য:</strong> আমরা সরাসরি কার্ড নম্বর সংরক্ষণ করি না; এটি আমাদের পেমেন্ট গেটওয়ে পার্টনারদের মাধ্যমে প্রক্রিয়াকরণ হয়।</li>
              <li><strong>সাধারণ তথ্য:</strong> IP অ্যাড্রেস, ব্রাউজার ধরন (অ্যানালিটিক্সের জন্য)।</li>
            </ul>
          </section>

          {/* Section 2: Usage */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-rose-600 flex items-center gap-2">
              <Eye size={18} /> ২. তথ্যের ব্যবহার (How We Use Your Data)
            </h2>
            <ul className="list-disc list-inside space-y-2 text-base ml-2 marker:text-rose-400">
              <li>আপনার অর্ডার প্রক্রিয়া করতে এবং ডেলিভারির জন্য।</li>
              <li>আপনার সাথে যোগাযোগ করতে (অর্ডার আপডেট বা প্রশ্নের উত্তরের জন্য)।</li>
              <li>আমাদের সেবার মান উন্নত করতে।</li>
            </ul>
          </section>

          {/* Section 3: Security */}
          <section className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">৩. নিরাপত্তা (Security)</h2>
            <p className="text-sm text-slate-600">
              আমরা আপনার তথ্য সুরক্ষিত রাখতে শিল্পমানের নিরাপত্তা ব্যবস্থা গ্রহণ করি। 
              তবে মনে রাখবেন, ইন্টারনেটের মাধ্যমে কোনও ট্রান্সমিশন ১০০% নিরাপদ বলে গ্যারান্টি দেওয়া যায় না।
            </p>
          </section>

          {/* Contact Box */}
          <section className="pt-4 border-t border-gray-100">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">প্রশ্ন বা অভিযোগ?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-slate-600">
                <span className="font-bold text-rose-600">Email:</span> support@rupshi.com
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <span className="font-bold text-rose-600">Phone:</span> +880 1XXXXXXX
              </div>
            </div>
          </section>

        </div>

        {/* Footer Action */}
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-100 flex justify-between items-center">
           <Link href="/terms" className="text-sm text-slate-500 hover:text-rose-600 transition-colors underline decoration-dotted">
             Read Terms of Service →
           </Link>
           <Link href="/" className="inline-flex items-center justify-center px-6 py-2 bg-rose-600 text-white text-sm font-semibold rounded-full hover:bg-rose-700 transition-all shadow-md active:scale-95">
             Back to Home
           </Link>
        </div>

      </div>
    </div>
  );
}
