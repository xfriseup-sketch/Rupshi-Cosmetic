"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const CONFETTI_COLORS = ["#db2777", "#f472b6", "#fbcfe8", "#9d174d", "#f9a8d4", "#ffffff"];
const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  delay: Math.random() * 3,
  duration: 3 + Math.random() * 3,
  size: 6 + Math.random() * 8,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  rotate: Math.random() * 360,
}));

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const trackHref = orderId
    ? `/track-order?id=${encodeURIComponent(orderId)}`
    : "/track-order";

  return (
    <main className="relative min-h-screen overflow-hidden bg-pink-50">
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        {confettiPieces.map((piece) => (
          <span
            key={piece.id}
            className="absolute top-[-20px] block animate-confetti-fall"
            style={{
              left: `${piece.left}%`,
              width: `${piece.size}px`,
              height: `${piece.size * 0.4}px`,
              backgroundColor: piece.color,
              transform: `rotate(${piece.rotate}deg)`,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              borderRadius: "2px",
            }}
          />
        ))}
      </div>

      <section className="relative z-10 mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center">
        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-[#db2777] to-[#9d174d] shadow-xl shadow-pink-200 animate-pop-in">
          <svg
            viewBox="0 0 52 52"
            className="h-16 w-16"
            fill="none"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path
              d="M14 27l8 8 16-18"
              style={{
                strokeDasharray: 48,
                strokeDashoffset: 48,
                animation: "draw-check 0.7s ease-out 0.3s forwards",
              }}
            />
          </svg>
        </div>

        <h1 className="mt-8 text-3xl md:text-4xl font-extrabold text-gray-900">
          আপনার অর্ডার সফলভাবে <span className="text-[#db2777]">গ্রহণ করা হয়েছে!</span>
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          ধন্যবাদ! আমাদের টিম খুব শীঘ্রই আপনার সাথে যোগাযোগ করবে।
        </p>

        <div className="mt-8 w-full rounded-2xl bg-white p-6 text-left shadow-lg shadow-pink-100 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                অর্ডার আইডি
              </p>
              <p className="mt-1 break-all font-mono text-lg font-bold text-[#db2777]">
                {orderId || "রূপসী-DEMO-ORDER"}
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-800">
              স্ট্যাটাস: পেন্ডিং
            </span>
          </div>

          <div className="mt-6 border-t border-dashed border-pink-200 pt-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              সম্ভাব্য ডেলিভারি সময়
            </p>
            <p className="mt-1 text-lg font-bold text-gray-900">২–৩ কর্মদিবসের মধ্যে</p>
            <p className="mt-2 text-sm text-gray-600">
              ঢাকার ভিতরে ২৪–৪৮ ঘণ্টা এবং ঢাকার বাইরে ২–৩ কর্মদিবসে পণ্য পৌঁছে যাবে।{" "}
              <span className="font-semibold text-gray-800">পেমেন্ট: ক্যাশ অন ডেলিভারি।</span>
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={trackHref}
            className="rounded-full bg-[#db2777] px-8 py-3.5 text-lg font-bold text-white shadow-lg shadow-pink-200 transition hover:bg-[#9d174d]"
          >
            Track Your Order
          </Link>
          <Link
            href="/shop"
            className="rounded-full border-2 border-[#db2777] px-8 py-3.5 text-lg font-bold text-[#db2777] transition hover:bg-pink-100"
          >
            শপিং চালিয়ে যান
          </Link>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          কোনো সমস্যা হলে যোগাযোগ করুন: ০৯৬৩৮-XXXXXX (সকাল ১০টা – রাত ৮টা)
        </p>
      </section>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-pink-50">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-pink-200 border-t-[#db2777]" />
            <p className="text-xl font-semibold text-[#db2777]">লোড হচ্ছে...</p>
          </div>
        </main>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
