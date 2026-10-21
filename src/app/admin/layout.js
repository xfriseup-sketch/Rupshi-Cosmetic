"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tags,
  SlidersHorizontal,
  Ticket,
  Cog,
  ExternalLink,
  Search,
  Bell,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/admin?tab=dashboard" },
  { id: "products", label: "Products", icon: Package, href: "/admin?tab=products" },
  { id: "orders", label: "Orders", icon: ShoppingBag, href: "/admin?tab=orders" },
  { id: "categories", label: "Categories", icon: Tags, href: "/admin?tab=categories" },
  { id: "homepage", label: "Homepage Settings", icon: SlidersHorizontal, href: "/admin?tab=homepage" },
  { id: "coupons", label: "Coupons", icon: Ticket, href: "/admin?tab=coupons" },
  { id: "settings", label: "Store Settings", icon: Cog, href: "/admin?tab=settings" },
];

const TAB_TITLES = {
  dashboard: "Dashboard",
  products: "Products",
  orders: "Orders",
  categories: "Categories",
  homepage: "Homepage Settings",
  coupons: "Coupons",
  settings: "Store Settings",
};

function AdminSidebar({ activeTab }) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-slate-900 text-white">
      <div className="border-b border-slate-800 px-5 py-4">
        <Link
          href="/"
          aria-label="রূপসী Cosmetic"
          className="flex flex-col items-start justify-center leading-none"
        >
          <span className="text-sm font-bold tracking-wide text-white">রূপসী</span>
          <span className="-mt-px text-[10px] font-medium uppercase tracking-widest text-slate-400">
            Cosmetic
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors ${
                isActive
                  ? "bg-pink-600 font-semibold text-white shadow-md"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={18} className="shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-slate-800 p-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <ExternalLink size={18} className="shrink-0" />
          <span>View Live Website</span>
        </Link>
      </div>
    </aside>
  );
}

function AdminHeader({ title, onLogout }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
      <h1 className="text-lg font-semibold text-slate-800">{title}</h1>

      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            placeholder="Search..."
            className="w-56 rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-pink-400 focus:outline-none focus:ring-1 focus:ring-pink-400"
          />
        </div>

        <button
          type="button"
          className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-gray-100 hover:text-slate-700"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-pink-500" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 text-xs font-bold text-pink-700">
            A
          </div>
          <span className="hidden text-sm font-medium text-slate-700 md:inline">
            Admin
          </span>
        </div>

        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
            aria-label="Logout"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        )}
      </div>
    </header>
  );
}

function AdminLayoutInner({ children }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const tab = searchParams.get("tab") || "products";
  const title = TAB_TITLES[tab] || "Admin";

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar activeTab={tab} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader title={title} />
        <main className="flex-1 overflow-y-auto p-6 sm:p-8">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-gray-50">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-200 border-t-pink-600" />
        </div>
      }
    >
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </Suspense>
  );
}
