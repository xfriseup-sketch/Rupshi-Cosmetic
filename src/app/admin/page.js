"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Lock, Package, ShoppingBag, LayoutDashboard, Ticket, Cog } from "lucide-react";
import CategoryManager from "@/components/CategoryManager";
import HomepageSettings from "@/components/Admin/HomepageSettings";

const ADMIN_PASSWORD = "rupshi2024";
const AUTH_KEY = "rupshi-admin-auth";

function formatBDT(amount) {
  return `৳${Number(amount || 0).toLocaleString("en-BD")}`;
}

const STATUS_BN = {
  pending: "Pending",
  processing: "Processing",
  delivered: "Delivered",
};

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
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "products";

  useEffect(() => {
    try {
      if (
        sessionStorage.getItem(AUTH_KEY) === "true" ||
        localStorage.getItem(AUTH_KEY) === "true"
      ) {
        setAuthed(true);
      }
    } catch {
      /* storage unavailable */
    }
    setChecked(true);
  }, []);

  const handleLogout = () => {
    try {
      sessionStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(AUTH_KEY);
    } catch {
      /* ignore */
    }
    setAuthed(false);
  };

  if (!checked) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-200 border-t-pink-600" />
      </div>
    );
  }

  if (!authed) {
    return <AdminLogin onLogin={() => setAuthed(true)} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-gray-50"
        >
          Logout
        </button>
      </div>

      {tab === "dashboard" && <DashboardOverview />}
      {tab === "products" && <ProductManager />}
      {tab === "orders" && <OrderManager />}
      {tab === "categories" && <CategoryManager />}
      {tab === "homepage" && <HomepageSettings />}
      {tab === "coupons" && <ComingSoon title="Coupons" icon={Ticket} />}
      {tab === "settings" && <ComingSoon title="Store Settings" icon={Cog} />}
    </div>
  );
}

function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      try {
        sessionStorage.setItem(AUTH_KEY, "true");
        localStorage.setItem(AUTH_KEY, "true");
      } catch {
        /* ignore */
      }
      setError("");
      onLogin();
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-pink-100">
            <Lock size={22} className="text-pink-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Admin Login</h1>
          <p className="mt-1 text-sm text-slate-500">Rupshi Cosmetics</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoFocus
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/30"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-pink-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-pink-700"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-pink-600 hover:underline">
            Back to store
          </Link>
        </div>
      </div>
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
    { label: "Products", value: stats.products, icon: Package, color: "bg-blue-50 text-blue-600" },
    { label: "Orders", value: stats.orders, icon: ShoppingBag, color: "bg-emerald-50 text-emerald-600" },
    { label: "Dashboard", value: "Live", icon: LayoutDashboard, color: "bg-pink-50 text-pink-600" },
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

function ProductManager() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbNotConfigured, setDbNotConfigured] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json().catch(() => null);
      if (res.status === 503 || data?.dbConfigured === false) {
        setDbNotConfigured(true);
        setProducts([]);
        return;
      }
      setDbNotConfigured(false);
      if (data?.success) setProducts(data.products || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-200 border-t-pink-600" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">Products</h2>
        <button
          type="button"
          onClick={fetchProducts}
          className="text-sm font-medium text-pink-600 hover:underline"
        >
          Refresh
        </button>
      </div>

      {dbNotConfigured && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Database not configured. Set MONGODB_URI to manage products.
        </div>
      )}

      {products.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">No products yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-slate-500">
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Brand</th>
                <th className="px-3 py-2 font-medium">Price</th>
                <th className="px-3 py-2 font-medium">Stock</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b border-gray-50">
                  <td className="px-3 py-2.5 font-medium text-slate-800">{p.name}</td>
                  <td className="px-3 py-2.5 text-slate-600">{p.brand || "—"}</td>
                  <td className="px-3 py-2.5 text-pink-600 font-semibold">
                    {formatBDT(p.discountPrice ?? p.price)}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.inStock
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {p.inStock ? "In stock" : "Out of stock"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json().catch(() => null);
        if (data?.success) setOrders(data.orders || []);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-200 border-t-pink-600" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-slate-800">Orders</h2>
      {orders.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">No orders yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-slate-500">
                <th className="px-3 py-2 font-medium">Customer</th>
                <th className="px-3 py-2 font-medium">Phone</th>
                <th className="px-3 py-2 font-medium">Total</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className="border-b border-gray-50">
                  <td className="px-3 py-2.5 font-medium text-slate-800">
                    {o.customerName}
                  </td>
                  <td className="px-3 py-2.5 text-slate-600" dir="ltr">
                    {o.phone}
                  </td>
                  <td className="px-3 py-2.5 font-semibold text-pink-600">
                    {formatBDT(o.totalAmount)}
                  </td>
                  <td className="px-3 py-2.5 text-slate-600">
                    {STATUS_BN[o.status] || o.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
