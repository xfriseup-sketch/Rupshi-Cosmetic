import Link from 'next/link';
import { ShieldAlert, FileText, CreditCard, Truck } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service | Rupshi Cosmetics',
  description: 'Read our terms and conditions for using Rupshi Cosmetics services.',
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Container with Glass Effect */}
      <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-8 md:p-10 border-b border-rose-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-rose-100 rounded-full text-rose-600">
              <FileText size={24} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
              ব্যবহারের শর্তাবলী
            </h1>
          </div>
          <p className="text-sm text-slate-500 font-medium">Effective Date: October 21, 2026</p>
        </div>

        {/* Content Body */}
        <div className="p-8 md:p-10 space-y-8 text-slate-700 leading-relaxed">
          
          {/* Intro */}
          <section>
            <p className="text-lg text-slate-600 italic border-l-4 border-rose-300 pl-4">
              রূপশী কসম্যাটিক্স ("আমরা", "আমাদের") আপনার সেবা গ্রহণের মাধ্যমে এই শর্তাবলী মেনে নেওয়ার প্রতিশ্রুতি দিচ্ছেন। 
              যদি আপনি এই শর্তাবলীর সাথে একমত না হন, অনুগ্রহ করে আমাদের সাইট ব্যবহার করবেন না।
            </p>
          </section>

          {/* Section 1: Orders & Payment */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-rose-600 flex items-center gap-2">
              <CreditCard size={18} /> ১. অর্ডার ও পেমেন্ট (Orders and Payment)
            </h2>
            <ul className="list-disc list-inside space-y-2 text-base ml-2 marker:text-rose-400">
              <li>সমস্ত অর্ডার আমাদের নিয়ন্ত্রণ সাপেক্ষে। আমরা যেকোনো অর্ডার বাতিল করার অধিকার সংরক্ষণ করি।</li>
              <li>পেমেন্ট অবশ্যই অর্ডার নিশ্চিত করার আগে বা ক্যাশ অন ডেলিভারির মাধ্যমে সম্পন্ন করতে হবে।</li>
              <li>দাম পরিবর্তনের অধিকার আমাদের সংরক্ষিত। কোনো ভুল টাইপিংয়ের কারণে দাম ভুল দেখালে আমরা সংশোধন করার অধিকার রাখি।</li>
            </ul>
          </section>

          {/* Section 2: Delivery */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-rose-600 flex items-center gap-2">
              <Truck size={18} /> ২. ডেলিভারি (Delivery)
            </h2>
            <p className="text-base ml-2">
              আমরা সর্বোচ্চ চেষ্টা করি নির্দিষ্ট সময়ের মধ্যে পণ্য পৌঁছে দিতে। তবে, আবহাওয়া, কুরিয়ার সমস্যা বা অন্যান্য জরুরি কারণে বিলম্ব হতে পারে। 
              ঠিকানা ভুল দেওয়া হলে ডেলিভারির দায়িত্ব আমাদের নয়। ঢাকার বাইরে ডেলিভারি চার্জ আলাদা হতে পারে।
            </p>
          </section>

          {/* Section 3: Returns & Refunds */}
          <section className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h2 className="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2">
              <ShieldAlert size={18} /> ৩. রিটার্ন ও রিফান্ড (Returns & Refunds)
            </h2>
            <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 ml-2">
              <li>পণ্য হাতে পাওয়ার ৭ দিনের মধ্যে রিটার্নের সুবিধা রয়েছে (শর্ত প্রযোজ্য)।</li>
              <li>পণ্য অবশ্যই অব্যবহৃত এবং মূল প্যাকেজিংয়ে থাকতে হবে।</li>
              <li>প্রসাধনী পণ্যের ক্ষেত্রে স্বাস্থ্য ঝুঁকির কারণে খোলা প্যাকেট রিটার্ন করা যাবে না।</li>
              <li>রিফান্ড প্রক্রিয়া শুরু হতে ৭-১৪ কর্মদিবস সময় লাগতে পারে।</li>
            </ul>
          </section>

          {/* Section 4: Liability */}
          <section>
            <h2 className="text-xl font-semibold text-rose-600 mb-2">৪. দায়সীমা (Limitation of Liability)</h2>
            <p className="text-base ml-2">
              রূপশী কসম্যাটিক্স কোনো পরোক্ষ বা বিশেষ ক্ষতির জন্য দায়ী থাকবে না যা এই শর্তাবলীর লঙ্ঘন থেকে উদ্ভূত হয়। 
              আমাদের সিদ্ধান্তই চূড়ান্ত বলে গণ্য হবে।
            </p>
          </section>

        </div>

        {/* Footer Action */}
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-100 flex justify-between items-center">
           <Link href="/privacy-policy" className="text-sm text-slate-500 hover:text-rose-600 transition-colors underline decoration-dotted">
             Read Privacy Policy →
           </Link>
           <Link href="/" className="inline-flex items-center justify-center px-6 py-2 bg-rose-600 text-white text-sm font-semibold rounded-full hover:bg-rose-700 transition-all shadow-md active:scale-95">
             Back to Home
           </Link>
        </div>

      </div>
    </div>
  );
}
