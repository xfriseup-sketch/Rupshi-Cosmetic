"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import GlobalFooter from "@/components/Footer";

/**
 * Wraps store pages with Navbar + Footer.
 * Admin routes (/admin*) render children only — no store chrome.
 */
export default function ClientShell({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#fdf8f9]">
      <Navbar />
      <main className="flex-1">{children}</main>
      <GlobalFooter />
    </div>
  );
}
