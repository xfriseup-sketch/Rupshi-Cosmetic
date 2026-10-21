import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center bg-rose-50/30 px-4 text-center">
      
      {/* 404 Number Styling - Large & Faded */}
      <h1 className="mb-2 text-9xl font-extrabold tracking-tighter text-rose-600 opacity-20 select-none">
        404
      </h1>

      {/* Main Message in Bangla */}
      <h2 className="mb-4 text-3xl font-bold text-slate-800 md:text-4xl">
        ওহো! পেজটি পাওয়া যায়নি
      </h2>
      
      <p className="mb-8 max-w-md text-lg text-slate-600">
        আপনি হয়তো ভুল লিংকে ক্লিক করেছেন অথবা পেজটি সরিয়ে নেওয়া হয়েছে। 
        নিচের বাটনগুলো ব্যবহার করে আবার শুরু করুন।
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row">
        
        {/* Primary Button: Home */}
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center rounded-full bg-rose-600 px-8 text-base font-semibold text-white shadow-lg transition-all hover:bg-rose-700 hover:shadow-xl active:scale-95"
        >
          হোমপেজে ফিরুন
        </Link>

        {/* Secondary Button: Shop */}
        <Link
          href="/shop"
          className="inline-flex h-12 items-center justify-center rounded-full border-2 border-rose-600 bg-transparent px-8 text-base font-semibold text-rose-600 transition-all hover:bg-rose-50 active:scale-95"
        >
          দোকানে যান
        </Link>

      </div>
    </div>
  );
}
