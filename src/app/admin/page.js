"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

const ADMIN_PASSWORD = "rupshi2024";
const AUTH_KEY = "rupshi-admin-auth";

const CATEGORIES = ["Skincare", "Makeup", "Haircare", "Fragrance"];

const CATEGORY_BN = {
  Skincare: "স্কিনকেয়ার",
  Makeup: "মেকআপ",
  Haircare: "হেয়ারকেয়ার",
  Fragrance: "ফ্র্যাগরেন্স",
};

const STATUS_BN = {
  pending: "পেন্ডিং",
  processing: "প্রসেসিং",
  delivered: "ডেলিভার্ড",
};

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-800 border-amber-300",
  processing: "bg-blue-100 text-blue-800 border-blue-300",
  delivered: "bg-green-100 text-green-800 border-green-300",
};

const emptyProductForm = {
  name: "",
  description: "",
  price: "",
  category: "Skincare",
  image: "",
  inStock: true,
};

/** Format a number as Bangladeshi Taka, e.g. ৳1,200 */
function formatBDT(amount) {
  return `৳${Number(amount || 0).toLocaleString("en-BD")}`;
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);

  // ---- Auth gate (demo-only protection) ----
  useEffect(() => {
    try {
      if (sessionStorage.getItem(AUTH_KEY) === "true" || localStorage.getItem(AUTH_KEY) === "true") {
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
      <main className="min-h-screen flex items-center justify-center bg-pink-50">
        <div className="animate-spin h-10 w-10 border-4 border-[#db2777] border-t-transparent rounded-full" />
      </main>
    );
  }

  if (!authed) {
    return <AdminLogin onLogin={() => setAuthed(true)} />;
  }

  return <AdminDashboard onLogout={handleLogout} />;
}

/* ------------------------------------------------------------------ */
/* Login screen                                                        */
/* ------------------------------------------------------------------ */
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
      setError("ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।");
    }
  };

  return (
    <main className="min-h-screen bg-pink-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-pink-100 p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🔐</div>
          <h1 className="text-2xl font-bold text-[#db2777]">অ্যাডমিন প্যানেল</h1>
          <p className="text-gray-500 text-sm mt-1">রূপসী - কসমেটিক শপ</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              পাসওয়ার্ড
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="পাসওয়ার্ড লিখুন"
              autoFocus
              className="w-full px-4 py-2.5 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-[#db2777] focus:border-transparent"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-[#db2777] hover:bg-[#9d174d] text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            লগইন করুন
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-[#db2777] hover:underline">
            ← হোমপেজে ফিরে যান
          </Link>
        </div>
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard with two tabs                                             */
/* ------------------------------------------------------------------ */
function AdminDashboard({ onLogout }) {
  const [tab, setTab] = useState("products"); // 'products' | 'orders'

  return (
    <main className="min-h-screen bg-pink-50 pb-16">
      {/* Header */}
      <header className="bg-[#db2777] text-white shadow-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="text-xl sm:text-2xl font-bold tracking-wide">
            রূপসী{" "}
            <span className="font-normal text-pink-200 text-sm hidden sm:inline">
              | অ্যাডমিন
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/shop"
              className="text-sm bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-lg transition-colors"
            >
              দোকান দেখুন
            </Link>
            <button
              onClick={onLogout}
              className="text-sm bg-white text-[#db2777] font-semibold px-3 py-1.5 rounded-lg hover:bg-pink-100 transition-colors"
            >
              লগআউট
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="flex gap-2 border-b border-pink-200">
          <button
            onClick={() => setTab("products")}
            className={`px-4 py-2.5 rounded-t-lg font-semibold text-sm sm:text-base transition-colors border-b-2 -mb-px ${
              tab === "products"
                ? "border-[#db2777] text-[#db2777] bg-white"
                : "border-transparent text-gray-500 hover:text-[#db2777]"
            }`}
          >
            📦 প্রোডাক্ট ম্যানেজমেন্ট
          </button>
          <button
            onClick={() => setTab("orders")}
            className={`px-4 py-2.5 rounded-t-lg font-semibold text-sm sm:text-base transition-colors border-b-2 -mb-px ${
              tab === "orders"
                ? "border-[#db2777] text-[#db2777] bg-white"
                : "border-transparent text-gray-500 hover:text-[#db2777]"
            }`}
          >
            🧾 অর্ডার ম্যানেজমেন্ট
          </button>
        </div>

        <section className="bg-white rounded-b-2xl rounded-tr-2xl shadow-sm border border-pink-100 border-t-0 p-4 sm:p-6">
          {tab === "products" ? <ProductManager /> : <OrderManager />}
        </section>
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Shared message banner                                               */
/* ------------------------------------------------------------------ */
function MessageBanner({ message, type }) {
  if (!message) return null;
  const styles =
    type === "success"
      ? "bg-green-50 text-green-800 border-green-200"
      : "bg-red-50 text-red-700 border-red-200";
  return (
    <div className={`border rounded-lg px-4 py-2.5 text-sm mb-4 ${styles}`}>{message}</div>
  );
}

/* ------------------------------------------------------------------ */
/* Product management tab                                              */
/* ------------------------------------------------------------------ */
function ProductManager() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyProductForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState(null); // { type, text }
  const [editing, setEditing] = useState(null); // product being edited (modal)
  const [deleting, setDeleting] = useState(null); // product pending delete confirm
  const [dbNotConfigured, setDbNotConfigured] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json().catch(() => null);

      // API returns 503 when MONGODB_URI is missing on the server —
      // show a friendly notice instead of an empty table.
      if (res.status === 503 || data?.dbConfigured === false) {
        setDbNotConfigured(true);
        setProducts([]);
        return;
      }

      setDbNotConfigured(false);
      if (data?.success) setProducts(data.products || []);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "প্রোডাক্ট লোড করা যায়নি" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateForm = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFieldErrors({});
    setMessage(null);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: Number(form.price) }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setFieldErrors(data.errors || {});
        setMessage({ type: "error", text: data.message || "প্রোডাক্ট যোগ করা যায়নি" });
      } else {
        setForm(emptyProductForm);
        setMessage({ type: "success", text: "নতুন প্রোডাক্ট যোগ হয়েছে ✅" });
        fetchProducts();
      }
    } catch {
      setMessage({ type: "error", text: "সার্ভারের সাথে সংযোগ হয়নি" });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (updated) => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/products?id=${updated._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return data; // let modal show field errors
      }
      setEditing(null);
      setMessage({ type: "success", text: "প্রোডাক্ট আপডেট হয়েছে ✅" });
      fetchProducts();
      return data;
    } catch {
      return { success: false, message: "সার্ভারের সাথে সংযোগ হয়নি" };
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/products?id=${deleting._id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: `"${deleting.name}" মুছে ফেলা হয়েছে 🗑️` });
        fetchProducts();
      } else {
        setMessage({ type: "error", text: data.message || "মুছে ফেলা যায়নি" });
      }
    } catch {
      setMessage({ type: "error", text: "সার্ভারের সাথে সংযোগ হয়নি" });
    } finally {
      setDeleting(null);
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <MessageBanner message={message?.text} type={message?.type} />

      {/* Add product form */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">➕ নতুন প্রোডাক্ট যোগ করুন</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">নাম *</label>
            <input
              value={form.name}
              onChange={updateForm("name")}
              placeholder="প্রোডাক্টের নাম"
              className="w-full px-3 py-2 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-[#db2777]"
            />
            {fieldErrors.name && <p className="text-red-600 text-xs mt-1">{fieldErrors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">দাম (৳) *</label>
            <input
              type="number"
              min="0"
              step="1"
              value={form.price}
              onChange={updateForm("price")}
              placeholder="যেমন: ৫৫০"
              className="w-full px-3 py-2 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-[#db2777]"
            />
            {fieldErrors.price && <p className="text-red-600 text-xs mt-1">{fieldErrors.price}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ক্যাটাগরি *</label>
            <select
              value={form.category}
              onChange={updateForm("category")}
              className="w-full px-3 py-2 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-[#db2777] bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_BN[c]} ({c})
                </option>
              ))}
            </select>
            {fieldErrors.category && (
              <p className="text-red-600 text-xs mt-1">{fieldErrors.category}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ইমেজ URL *</label>
            <input
              type="url"
              value={form.image}
              onChange={updateForm("image")}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-[#db2777]"
            />
            {fieldErrors.image && <p className="text-red-600 text-xs mt-1">{fieldErrors.image}</p>}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">বিবরণ</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={updateForm("description")}
              placeholder="প্রোডাক্ট সম্পর্কে সংক্ষেপে লিখুন"
              className="w-full px-3 py-2 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-[#db2777] resize-y"
            />
          </div>

          <div className="flex items-center justify-between sm:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.inStock}
                onChange={updateForm("inStock")}
                className="h-4 w-4 accent-[#db2777]"
              />
              <span className="text-sm text-gray-700">স্টকে আছে</span>
            </label>

            <button
              type="submit"
              disabled={saving}
              className="bg-[#db2777] hover:bg-[#9d174d] disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
            >
              {saving ? "যোগ হচ্ছে..." : "যোগ করুন"}
            </button>
          </div>
        </form>
      </div>

      {/* Products table */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          📋 সব প্রোডাক্ট ({products.length}টি)
        </h2>

        {loading ? (
          <p className="text-gray-500 py-8 text-center animate-pulse">লোড হচ্ছে...</p>
        ) : products.length === 0 && dbNotConfigured ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-6 py-8 text-center">
            <p className="font-semibold text-amber-800">
              🗄️ ডাটাবেস কনফিগার করা হয়নি।{" "}
              <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs">MONGODB_URI</code>{" "}
              সেট করার পর প্রোডাক্ট এখানে দেখা যাবে।
            </p>
          </div>
        ) : products.length === 0 ? (
          <p className="text-gray-500 py-8 text-center">কোনো প্রোডাক্ট পাওয়া যায়নি</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-pink-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#db2777] text-white text-left">
                  <th className="px-4 py-3 font-semibold">ছবি</th>
                  <th className="px-4 py-3 font-semibold">নাম</th>
                  <th className="px-4 py-3 font-semibold">ক্যাটাগরি</th>
                  <th className="px-4 py-3 font-semibold">দাম</th>
                  <th className="px-4 py-3 font-semibold">স্টক</th>
                  <th className="px-4 py-3 font-semibold text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-t border-pink-100 hover:bg-pink-50/50">
                    <td className="px-4 py-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-12 w-12 rounded-lg object-cover border border-pink-100"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-[220px] truncate">
                      {p.name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-pink-100 text-[#9d174d]">
                        {CATEGORY_BN[p.category] || p.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#db2777] font-semibold">{formatBDT(p.price)}</td>
                    <td className="px-4 py-3">
                      {p.inStock ? (
                        <span className="text-green-600 font-medium">✓ স্টকে</span>
                      ) : (
                        <span className="text-red-500 font-medium">✗ নেই</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditing(p)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          ✏️ এডিট
                        </button>
                        <button
                          onClick={() => setDeleting(p)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        >
                          🗑️ ডিলিট
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editing && (
        <EditProductModal
          product={editing}
          saving={saving}
          onClose={() => setEditing(null)}
          onSave={handleUpdate}
        />
      )}

      {/* Delete confirmation dialog */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">⚠️ ডিলিট নিশ্চিত করুন</h3>
            <p className="text-gray-600 text-sm mb-5">
              আপনি{" "}
              <span className="font-semibold text-[#db2777]">"{deleting.name}"</span>{" "}
              প্রোডাক্টটি স্থায়ীভাবে মুছে ফেলতে চান? এই কাজটি ফেরানো যাবে না।
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleting(null)}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                বাতিল
              </button>
              <button
                onClick={confirmDelete}
                disabled={saving}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
              >
                {saving ? "মুছছে..." : "হ্যাঁ, মুছে ফেলুন"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Edit product modal                                                  */
/* ------------------------------------------------------------------ */
function EditProductModal({ product, onClose, onSave, saving }) {
  const [form, setForm] = useState({
    name: product.name || "",
    description: product.description || "",
    price: product.price ?? "",
    category: product.category || "Skincare",
    image: product.image || "",
    inStock: Boolean(product.inStock),
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorText, setErrorText] = useState("");

  const update = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setErrorText("");
    const result = await onSave({ ...form, price: Number(form.price) });
    if (result && !result.success) {
      setFieldErrors(result.errors || {});
      setErrorText(result.message || "আপডেট করা যায়নি");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 my-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">✏️ প্রোডাক্ট এডিট করুন</h3>
          <button
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="h-8 w-8 rounded-full bg-pink-50 text-[#db2777] font-bold hover:bg-pink-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {errorText && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
            {errorText}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">নাম *</label>
            <input
              value={form.name}
              onChange={update("name")}
              className="w-full px-3 py-2 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-[#db2777]"
            />
            {fieldErrors.name && <p className="text-red-600 text-xs mt-1">{fieldErrors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">দাম (৳) *</label>
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={update("price")}
                className="w-full px-3 py-2 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-[#db2777]"
              />
              {fieldErrors.price && (
                <p className="text-red-600 text-xs mt-1">{fieldErrors.price}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ক্যাটাগরি *</label>
              <select
                value={form.category}
                onChange={update("category")}
                className="w-full px-3 py-2 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-[#db2777] bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_BN[c]}
                  </option>
                ))}
              </select>
              {fieldErrors.category && (
                <p className="text-red-600 text-xs mt-1">{fieldErrors.category}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ইমেজ URL *</label>
            <input
              type="url"
              value={form.image}
              onChange={update("image")}
              className="w-full px-3 py-2 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-[#db2777]"
            />
            {fieldErrors.image && (
              <p className="text-red-600 text-xs mt-1">{fieldErrors.image}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">বিবরণ</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={update("description")}
              className="w-full px-3 py-2 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-[#db2777] resize-y"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.inStock}
              onChange={update("inStock")}
              className="h-4 w-4 accent-[#db2777]"
            />
            <span className="text-sm text-gray-700">স্টকে আছে</span>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#db2777] text-white hover:bg-[#9d174d] disabled:opacity-60 transition-colors"
            >
              {saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Order management tab                                                */
/* ------------------------------------------------------------------ */
function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | pending | processing | delivered
  const [updatingId, setUpdatingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [dbNotConfigured, setDbNotConfigured] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json().catch(() => null);

      if (res.status === 503 || data?.dbConfigured === false) {
        setDbNotConfigured(true);
        setOrders([]);
        return;
      }

      setDbNotConfigured(false);
      if (data?.success) setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "অর্ডার লোড করা যায়নি" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const changeStatus = async (orderId, status) => {
    setUpdatingId(orderId);
    setMessage(null);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();

      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: data.order.status } : o))
        );
        setMessage({ type: "success", text: "অর্ডারের স্ট্যাটাস আপডেট হয়েছে ✅" });
      } else {
        setMessage({ type: "error", text: data.message || "স্ট্যাটাস আপডেট করা যায়নি" });
      }
    } catch {
      setMessage({ type: "error", text: "সার্ভারের সাথে সংযোগ হয়নি" });
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const countByStatus = (s) => orders.filter((o) => o.status === s).length;

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-4">
        🧾 সব অর্ডার ({orders.length}টি)
      </h2>

      <MessageBanner message={message?.text} type={message?.type} />

      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        {[
          { key: "all", label: "সব" },
          { key: "pending", label: STATUS_BN.pending },
          { key: "processing", label: STATUS_BN.processing },
          { key: "delivered", label: STATUS_BN.delivered },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
              filter === key
                ? "bg-[#db2777] text-white border-[#db2777]"
                : "bg-white text-gray-600 border-pink-200 hover:border-[#db2777] hover:text-[#db2777]"
            }`}
          >
            {label}
            {key !== "all" && (
              <span className="ml-1.5 text-xs opacity-75">({countByStatus(key)})</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500 py-8 text-center animate-pulse">লোড হচ্ছে...</p>
      ) : orders.length === 0 && dbNotConfigured ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-6 py-8 text-center">
          <p className="font-semibold text-amber-800">
            🗄️ ডাটাবেস কনফিগার করা হয়নি।{" "}
            <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs">MONGODB_URI</code>{" "}
            সেট করার পর অর্ডার এখানে দেখা যাবে।
          </p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <p className="text-gray-500 py-8 text-center">
          {orders.length === 0
            ? "এখনো কোনো অর্ডার আসেনি"
            : "এই স্ট্যাটাসে কোনো অর্ডার নেই"}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-pink-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#db2777] text-white text-left">
                <th className="px-4 py-3 font-semibold">গ্রাহকের নাম</th>
                <th className="px-4 py-3 font-semibold">ফোন</th>
                <th className="px-4 py-3 font-semibold">ঠিকানা</th>
                <th className="px-4 py-3 font-semibold">পণ্যসমূহ</th>
                <th className="px-4 py-3 font-semibold">মোট</th>
                <th className="px-4 py-3 font-semibold">তারিখ</th>
                <th className="px-4 py-3 font-semibold">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr
                  key={order._id}
                  className="border-t border-pink-100 align-top hover:bg-pink-50/50"
                >
                  <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                    {order.customerName}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap" dir="ltr">
                    {order.phone}
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[200px]">{order.address}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[240px]">
                    <ul className="list-disc list-inside space-y-0.5">
                      {order.items.map((item, i) => (
                        <li key={i} className="truncate">
                          {item.name} × {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-3 text-[#db2777] font-semibold whitespace-nowrap">
                    {formatBDT(order.totalAmount)}
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("bn-BD")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      disabled={updatingId === order._id}
                      onChange={(e) => changeStatus(order._id, e.target.value)}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#db2777] cursor-pointer ${
                        STATUS_STYLES[order.status] || ""
                      } ${updatingId === order._id ? "opacity-50" : ""}`}
                    >
                      {Object.entries(STATUS_BN).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
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
