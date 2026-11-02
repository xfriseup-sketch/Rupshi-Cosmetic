"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Package, ShoppingBag, LayoutDashboard, Cog, LogOut } from "lucide-react";
import ProductManager from "@/components/Admin/ProductManager";
import OrderManager from "@/components/Admin/OrderManager";
import CategoryManager from "@/components/Admin/CategoryManager";
import HomepageSettings from "@/components/Admin/HomepageSettings";
import CouponManager from "@/components/Admin/CouponManager";
import SupportManager from "@/components/Admin/SupportManager";

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-200 border-t-pink-600" />
        </div>
      }
    >
      <AdminPageInner />
    </Suspense>
  );
}

function AdminPageInner() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "products";

  return (
    <div className="space-y-4">
      <div className="flex justify-end lg:hidden">
        <form action="/api/admin/logout" method="post">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-gray-50"
          >
            <LogOut size={16} />
            Logout
          </button>
        </form>
      </div>

      {tab === "dashboard" && <DashboardOverview />}
      {tab === "products" && <ProductManager />}
      {tab === "orders" && <OrderManager />}
      {tab === "categories" && <CategoryManager />}
      {tab === "homepage" && <HomepageSettings />}
      {tab === "coupons" && <CouponManager />}
      {tab === "support" && <SupportManager />}
      {tab === "settings" && <ComingSoon title="Store Settings" icon={Cog} />}
    </div>
  );
}

function ComingSoon({ title, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-pink-50">
        <Icon size={28} className="text-pink-600" />
      </div>
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      <p className="mt-2 text-sm text-slate-500">Coming soon in a future update.</p>
    </div>
  );
}

function DashboardOverview() {
  const [stats, setStats] = useState({ products: 0, orders: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [p, o] = await Promise.all([
          fetch("/api/products").then((r) => r.json()).catch(() => null),
          fetch("/api/orders").then((r) => r.json()).catch(() => null),
        ]);
        setStats({
          products: p?.count || p?.products?.length || 0,
          orders: o?.orders?.length || 0,
        });
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const cards = [
    {
      label: "Products",
      value: stats.products,
      icon: Package,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Orders",
      value: stats.orders,
      icon: ShoppingBag,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Dashboard",
      value: "Live",
      icon: LayoutDashboard,
      color: "bg-pink-50 text-pink-600",
    },
  ];

  return (
    <div>
      <h2 className="mb-6 text-xl font-bold text-slate-800">Overview</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className={`mb-3 inline-flex rounded-xl p-2.5 ${c.color}`}>
                <Icon size={20} />
              </div>
              <p className="text-2xl font-bold text-slate-800">{c.value}</p>
              <p className="text-sm text-slate-500">{c.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
