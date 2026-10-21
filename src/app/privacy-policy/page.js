import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | Rupshi Cosmetics',
  description: 'Read our privacy policy to understand how we collect and use your data.',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-8 md:p-12">
        
        {/* Header */}
        <h1 className="text-3xl font-bold text-slate-900 mb-6 border-b pb-4">
          গোপনীয়তা নীতিমালা (Privacy Policy)
        </h1>
        
        <p className="text-sm text-gray-500 mb-8">Last Updated: October 21, 2026</p>

        {/* Content Sections */}
        <div className="prose prose-slate max-w-none space-y-6 text-gray-700 leading-relaxed">
          
          <section>
            <h2 className="text-xl font-semibold text-rose-600 mb-2">১. পরিচিতি (Introduction)</h2>
            <p>
              রূপশী কসমেটিক্স ("আমরা", "আমাদের") আপনার গোপনীয়তার প্রতি শ্রদ্ধাশীল। 
              এই নীতিমালা ব্যাখ্যা করে যে আমরা কীভাবে আপনার তথ্য সংগ্রহ করি, ব্যবহার করি এবং সুরক্ষিত রাখি।
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-rose-600 mb-2">২. তথ্য সংগ্রহ (Information We Collect)</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>ব্যক্তিগত তথ্য:</strong> নাম, ঠিকানা, ফোন নম্বর, ইমেইল (অর্ডার করার সময়)।</li>
              <li><strong>পেমেন্ট তথ্য:</strong> আমরা সরাসরি কার্ড নম্বর সংরক্ষণ করি না; এটি আমাদের পেমেন্ট গেটওয়ে পার্টনারদের মাধ্যমে প্রক্রিয়াকরণ হয়।</li>
              <li><strong>সাধারণ তথ্য:</strong> IP অ্যাড্রেস, ব্রাউজার ধরন (অ্যানালিটিক্সের জন্য)।</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-rose-600 mb-2">৩. তথ্যের ব্যবহার (How We Use Your Data)</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>আপনার অর্ডার প্রক্রিয়া করতে এবং ডেলিভারির জন্য।</li>
              <li>আপনার সাথে যোগাযোগ করতে (অর্ডার আপডেট বা প্রশ্নের উত্তরের জন্য)।</li>
              <li>আমাদের সেবার মান উন্নত করতে।</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-rose-600 mb-2">৪. তথ্য শেয়ারিং (Data Sharing)</h2>
            <p>
              আমরা আপনার ব্যক্তিগত তথ্য কোনো তৃতীয় পক্ষের কাছে বিক্রি বা ভাড়া দিই না। 
              শুধুমাত্র ডেলিভারি পার্টনার (কুরিয়ার সার্ভিস) এবং পেমেন্ট গেটওয়েকে প্রয়োজনীয় তথ্য দেওয়া হয় অর্ডার সম্পন্ন করার জন্য।
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-rose-600 mb-2">৫. নিরাপত্তা (Security)</h2>
            <p>
              আমরা আপনার তথ্য সুরক্ষিত রাখতে শিল্পমানের নিরাপত্তা ব্যবস্থা গ্রহণ করি। 
              তবে মনে রাখবেন, ইন্টারনেটের মাধ্যমে কোনো ট্রান্সমিশন ১০০% নিরাপদ বলে গ্যারান্টি দেওয়া যায় না।
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-rose-600 mb-2">৬. যোগাযোগ (Contact Us)</h2>
            <p>
              যদি আপনার গোপনীয়তা নীতিমালা নিয়ে কোনো প্রশ্ন থাকে, তাহলে আমাদের সাথে যোগাযোগ করুন:
              <br/>
              Email: support@rupshi.vercel.app <br/>
              Phone: +880 1XXXXXXX
            </p>
          </section>

        </div>

        {/* Footer Button */}
        <div className="mt-10 pt-6 border-t">
          <Link href="/" className="inline-flex items-center text-rose-600 hover:text-rose-800 font-medium">
            ← হোমপেজে ফিরুন
          </Link>
        </div>
      </div>
    </div>
  );
}
