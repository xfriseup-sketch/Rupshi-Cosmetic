import Link from 'next/link';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export const metadata = {
  title: 'Contact Us | Rupshi Cosmetics',
  description: 'Get in touch with Rupshi Cosmetics for inquiries, support, or partnerships.',
};

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">যোগাযোগ করুন</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            আপনার যেকোনো প্রশ্ন, অভিযোগ বা সহযোগিতার জন্য আমরা সদা প্রস্তুত। 
            আমাদের সাথে যোগাযোগ করুন।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left Side: Info Cards */}
          <div className="space-y-6">
            
            <div className="bg-white p-6 rounded-xl shadow-md flex items-start gap-4 border border-rose-100/50">
              <div className="bg-rose-100 p-3 rounded-full text-rose-600">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">ইমেইল</h3>
                <p className="text-gray-600 mt-1">support@rupshi.com</p>
                <p className="text-sm text-gray-500 mt-2">২৪ ঘণ্টার মধ্যে উত্তর দেওয়া হবে।</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md flex items-start gap-4 border border-rose-100/50">
              <div className="bg-green-100 p-3 rounded-full text-green-600">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">ফোন / হোয়াটসঅ্যাপ</h3>
                <p className="text-gray-600 mt-1">+৮৮ ১৯XX XXX XXX</p>
                <p className="text-sm text-gray-500 mt-2">সকাল ১০টা - রাত ৮টা (শনি-বৃহঃ)</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md flex items-start gap-4 border border-rose-100/50">
              <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">ঠিকানা</h3>
                <p className="text-gray-600 mt-1">ঢাকা, বাংলাদেশ</p>
                <p className="text-sm text-gray-500 mt-2">অনলাইন শপ, ভিজিটের সুবিধা নেই।</p>
              </div>
            </div>

          </div>

          {/* Right Side: Simple Form */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-rose-100/50">
            <h2 className="text-xl font-bold text-slate-900 mb-6">মেসেজ পাঠান</h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">আপনার নাম</label>
                <input type="text" id="name" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none" placeholder="নাম লিখুন..." />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">ইমেইল</label>
                <input type="email" id="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none" placeholder="example@email.com" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">মেসেজ</label>
                <textarea id="message" rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none resize-none" placeholder="আপনার বার্তা লিখুন..."></textarea>
              </div>
              <button 
                type="submit" 
                className="w-full bg-rose-600 text-white font-bold py-3 rounded-lg hover:bg-rose-700 transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <Send size={18} /> মেসেজ পাঠান
              </button>
            </form>
          </div>

        </div>

        <div className="mt-12 text-center">
           <Link href="/shop" className="text-rose-600 hover:underline font-medium">
             → কেনাকাটা শুরু করুন
           </Link>
        </div>

      </div>
    </div>
  );
}
