"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * ক্যাটেগরি ম্যানেজমেন্ট tab (admin panel).
 *
 * - Form to add a new category (Name + Icon emoji; slug auto-generated
 *   server-side, optional override).
 * - Table of existing categories with Edit (inline row form) and Delete
 *   (confirmation dialog) buttons.
 * - Talks to /api/categories (GET/POST) and /api/categories/[id]
 *   (PUT/DELETE). Handles 503 (DB not configured) gracefully.
 */

const emptyForm = { name: "", icon: "🛍️", slug: "" };

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState(null); // { type, text }
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [deleting, setDeleting] = useState(null); // category pending delete confirm
  const [dbNotConfigured, setDbNotConfigured] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json().catch(() => null);

      if (res.status === 503 || data?.dbConfigured === false) {
        setDbNotConfigured(true);
        setCategories([]);
        return;
      }

      setDbNotConfigured(false);
      if (data?.success) setCategories(data.categories || []);
      else if (data?.message) setMessage({ type: "error", text: data.message });
    } catch {
      setMessage({ type: "error", text: "ক্যাটেগরি লোড করা যায়নি" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /* ---------------------------- create ---------------------------- */
  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setCategories((prev) => [...prev, data.category]);
        setForm(emptyForm);
        setMessage({ type: "success", text: data.message || "নতুন ক্যাটেগরি যোগ হয়েছে ✅" });
      } else {
        // Duplicate ("Category exists") and validation errors come back here
        setMessage({ type: "error", text: data.message || "ক্যাটেগরি যোগ করা যায়নি" });
      }
    } catch {
      setMessage({ type: "error", text: "সার্ভারের সাথে সংযোগ হয়নি" });
    } finally {
      setSaving(false);
    }
  };

  /* ------------------------------ edit ----------------------------- */
  const startEdit = (cat) => {
    setEditingId(cat._id);
    setEditForm({ name: cat.name, icon: cat.icon || "🛍️", slug: cat.slug || "" });
    setMessage(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/categories/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setCategories((prev) => prev.map((c) => (c._id === editingId ? data.category : c)));
        setEditingId(null);
        setMessage({ type: "success", text: data.message || "ক্যাটেগরি আপডেট হয়েছে ✅" });
      } else {
        setMessage({ type: "error", text: data.message || "আপডেট করা যায়নি" });
      }
    } catch {
      setMessage({ type: "error", text: "সার্ভারের সাথে সংযোগ হয়নি" });
    } finally {
      setSaving(false);
    }
  };

  /* ----------------------------- delete ---------------------------- */
  const handleDelete = async () => {
    if (!deleting) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/categories/${deleting._id}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok && data.success) {
        setCategories((prev) => prev.filter((c) => c._id !== deleting._id));
        setMessage({ type: "success", text: `"${deleting.name}" ক্যাটেগরি মুছে ফেলা হয়েছে` });
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

  const inputClass =
    "w-full px-3 py-2 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-[#db2777]";

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-4">
        🏷️ ক্যাটেগরি ম্যানেজমেন্ট ({categories.length}টি)
      </h2>

      {message && (
        <div
          className={`border rounded-lg px-4 py-2.5 text-sm mb-4 ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Add-new-category form */}
      <form
        onSubmit={handleCreate}
        className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-pink-50/60 border border-pink-100 rounded-xl p-4 mb-6"
      >
        <div className="sm:col-span-5">
          <label className="block text-xs font-medium text-gray-600 mb-1">ক্যাটেগরির নাম *</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="যেমন: Fragrance"
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">আইকন (emoji)</label>
          <input
            value={form.icon}
            onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}
            placeholder="🌸"
            maxLength={4}
            className={`${inputClass} text-center`}
          />
        </div>
        <div className="sm:col-span-3">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Slug <span className="text-gray-400">(ঐচ্ছিক)</span>
          </label>
          <input
            dir="ltr"
            value={form.slug}
            onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
            placeholder="auto থেকে তৈরি হবে"
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2 flex items-end">
          <button
            type="submit"
            disabled={saving}
            className="w-full px-4 py-2 rounded-lg text-sm font-semibold bg-[#db2777] text-white hover:bg-[#9d174d] disabled:opacity-60 transition-colors"
          >
            {saving ? "সেভ হচ্ছে..." : "+ যোগ করো"}
          </button>
        </div>
      </form>

      {/* List */}
      {loading ? (
        <p className="text-gray-500 py-8 text-center animate-pulse">লোড হচ্ছে...</p>
      ) : dbNotConfigured ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-6 py-8 text-center">
          <p className="font-semibold text-amber-800">
            🗄️ ডাটাবেস কনফিগার করা হয়নি।{" "}
            <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs">MONGODB_URI</code>{" "}
            সেট করার পর ক্যাটেগরি এখানে যোগ ও ব্যবহার করা যাবে।
          </p>
        </div>
      ) : categories.length === 0 ? (
        <p className="text-gray-500 py-8 text-center">এখনো কোনো ক্যাটেগরি নেই — উপরে থেকে যোগ করুন।</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-pink-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#db2777] text-white text-left">
                <th className="px-4 py-3 font-semibold">আইকন</th>
                <th className="px-4 py-3 font-semibold">নাম</th>
                <th className="px-4 py-3 font-semibold">Slug</th>
                <th className="px-4 py-3 font-semibold text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) =>
                editingId === cat._id ? (
                  <tr key={cat._id} className="border-t border-pink-100 bg-pink-50/50">
                    <td colSpan={4} className="px-4 py-3">
                      <form onSubmit={handleUpdate} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                        <div className="sm:col-span-2">
                          <label className="block text-xs text-gray-500 mb-0.5">আইকন</label>
                          <input
                            value={editForm.icon}
                            onChange={(e) => setEditForm((p) => ({ ...p, icon: e.target.value }))}
                            maxLength={4}
                            className={`${inputClass} text-center`}
                          />
                        </div>
                        <div className="sm:col-span-4">
                          <label className="block text-xs text-gray-500 mb-0.5">নাম *</label>
                          <input
                            required
                            value={editForm.name}
                            onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                            className={inputClass}
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-xs text-gray-500 mb-0.5">Slug</label>
                          <input
                            dir="ltr"
                            value={editForm.slug}
                            onChange={(e) => setEditForm((p) => ({ ...p, slug: e.target.value }))}
                            className={inputClass}
                          />
                        </div>
                        <div className="sm:col-span-3 flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-3 py-2 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200"
                          >
                            বাতিল
                          </button>
                          <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#db2777] text-white hover:bg-[#9d174d] disabled:opacity-60"
                          >
                            {saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
                          </button>
                        </div>
                      </form>
                    </td>
                  </tr>
                ) : (
                  <tr key={cat._id} className="border-t border-pink-100 hover:bg-pink-50/50">
                    <td className="px-4 py-3 text-2xl">{cat.icon || "🛍️"}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{cat.name}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs" dir="ltr">
                      {cat.slug}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => startEdit(cat)}
                        className="px-3 py-1.5 mr-2 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                      >
                        ✏️ এডিট
                      </button>
                      <button
                        onClick={() => setDeleting(cat)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
                      >
                        🗑️ ডিলিট
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">ডিলিট নিশ্চিত করুন</h3>
            <p className="mt-2 text-sm text-gray-600">
              আপনি কি <span className="font-semibold text-[#db2777]">"{deleting.name}"</span>{" "}
              ক্যাটেগরিটি মুছে ফেলতে চান? এই কাজটি ফেরানো যাবে না।
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setDeleting(null)}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                বাতিল
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
              >
                হ্যাঁ, মুছে ফেলো
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
