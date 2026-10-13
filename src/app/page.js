import Link from "next/link";
import Navbar from "@/components/Navbar";

const categories = [
  {
    name: "স্কিনকেয়ার",
    english: "Skincare",
    icon: "🧴",
    description: "ফেসওয়াশ, ক্রিম, সিরাম ও ময়েশ্চারাইজার",
    href: "/shop?cat=skincare",
  },
  {
    name: "মেকআপ",
    english: "Makeup",
    icon: "💄",
    description: "লিপস্টিক, ফাউন্ডেশন, আইলাইনার ও ব্লাশ",
    href: "/shop?cat=makeup",
  },
  {
    name: "হেয়ারকেয়ার",
    english: "Haircare",
    icon: "💇‍♀️",
    description: "শ্যাম্পু, হেয়ার অয়েল ও হেয়ার মাস্ক",
    href: "/shop?cat=haircare",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-pink-50">
      {/* Navbar */}
      <Navbar active="home" />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-pink-100 via-pink-50 to-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-24 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-900">
            তোমার আসল সৌন্দর্য{" "}
            <span className="text-[#db2777]">ফুটে উঠুক</span>
          </h1>
          <p className="max-w-xl text-lg text-gray-600">
            ১০০% অরিজিনাল কসমেটিক পণ্য, সাশ্রয়ী দামে। বিশ্বস্ততার সাথে যত্ন নাও
            নিজের।
          </p>
          <Link
            href="/shop"
            className="rounded-full bg-[#db2777] px-8 py-3 text-lg font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:bg-[#9d174d]"
          >
            কেনাকাটা শুরু করো
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-10 text-center text-3xl font-bold text-gray-900">
          জনপ্রিয় <span className="text-[#db2777]">ক্যাটাগরি</span>
        </h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.english}
              href={cat.href}
              className="group rounded-2xl border border-pink-100 bg-white p-8 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-[#db2777] hover:shadow-lg"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pink-100 text-3xl transition-colors group-hover:bg-[#db2777]">
                <span>{cat.icon}</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 group-hover:text-[#db2777]">
                {cat.name}
              </h3>
              <p className="mt-2 text-sm text-gray-500">{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#9d174d] py-8 text-center text-pink-100">
        <p className="text-lg font-semibold">রূপসী - কসমেটিক শপ</p>
        <p className="mt-2 text-sm">
          © ২০২৬ রূপসী। সর্বস্বত্ব সংরক্ষিত।
        </p>
      </footer>
    </main>
  );
}
