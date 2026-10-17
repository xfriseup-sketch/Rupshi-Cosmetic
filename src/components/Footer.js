import Link from "next/link";

/**
 * Global footer (Phase 7.6 PRIORITY #3) — brand, Bengali nav links and
 * copyright. Rendered once in the root layout so EVERY page (including
 * /product/[slug]) gets a consistent footer at the bottom.
 */
export default function Footer() {
  return (
    <footer className="bg-gray-900 py-8 text-center text-white">
      <p className="text-xl font-bold" style={{ color: "#db2777" }}>
        রূপসী
      </p>
      <nav className="mt-4 flex items-center justify-center gap-6 text-sm">
        <Link
          href="/"
          className="text-gray-300 transition-colors hover:text-white"
        >
          হোম
        </Link>
        <Link
          href="/shop"
          className="text-gray-300 transition-colors hover:text-white"
        >
          দোকান
        </Link>
        <a
          href="mailto:support@rupshi.com"
          className="text-gray-300 transition-colors hover:text-white"
        >
          যোগাযোগ
        </a>
      </nav>
      <p className="mt-4 text-xs text-gray-400">
        © ২০২৪ রূপসী কসমেটিক্স. সর্বস্বত্ব সংরক্ষিত।
      </p>
    </footer>
  );
}
