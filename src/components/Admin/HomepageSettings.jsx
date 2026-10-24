"use client";

import { useEffect, useState, useCallback } from "react";
import ImageUploadField from "@/components/ImageUploadField";
import { Megaphone, Eye, Hash, Gift, Save } from "lucide-react";

function ToggleSwitch({ checked, onChange, label, description }) {
  return (
    <label className="flex cursor-pointer select-none items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-pink-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      <div>
        <span className="text-sm font-medium text-gray-800">{label}</span>
        {description && (
          <p className="mt-0.5 text-xs text-gray-500">{description}</p>
        )}
      </div>
    </label>
  );
}

const DEFAULTS = {
  noticeBar: {
    text: "Free Express Delivery on orders over ৳1,999! Code: GLOW2026",
    isActive: true,
    bgColor: "#e11d48",
  },
  heroSection: { isVisible: true },
  promotionalBanner: {
    title: "নতুন কালেকশন এখন লাইভ",
    subtitle: "Beauty, Fashion ও Tech — এক জায়গায় বেছে নিন।",
    buttonText: "শপ করুন",
    buttonLink: "/shop",
    imageUrl: "",
    isActive: true,
  },
  categoriesSection: { isVisible: true, maxItems: 4 },
  bestSellersSection: { isVisible: true, maxItems: 4 },
  hotOffersSection: { isVisible: true, maxItems: 3 },
  fashionSection: { isVisible: true, maxItems: 4 },
  techSection: { isVisible: true, maxItems: 4 },
  promoBanner: {
    title: "Get Up to 35% OFF",
    subtitle:
      "Limited-time luxury deals on premium skincare & makeup. Glow starts now.",
    buttonText: "Claim Deal Now",
    buttonLink: "/shop?hotOffer=true",
    imageUrl: "",
    couponCode: "",
    isActive: true,
  },
  newArrivalsSection: { isVisible: true, maxItems: 4 },
  reviewsSection: { isVisible: true },
  whyChooseUsSection: { isVisible: true },
};

function mergeSettings(incoming) {
  if (!incoming || typeof incoming !== "object") return { ...DEFAULTS };
  const out = JSON.parse(JSON.stringify(DEFAULTS));
  for (const key of Object.keys(DEFAULTS)) {
    if (incoming[key] != null && typeof incoming[key] === "object") {
      out[key] = { ...out[key], ...incoming[key] };
    }
  }
  return out;
}

export default function HomepageSettings() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/settings", { cache: "no-store" });
      const data = await res.json().catch(() => null);
      if (data?.success && data.settings) {
        setSettings(mergeSettings(data.settings));
      }
    } catch {
      /* use defaults */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        setMessage({ type: "success", text: "Settings saved — refresh the homepage to see changes" });
        if (data.settings) setSettings(mergeSettings(data.settings));
      } else if (res.status === 503) {
        setMessage({
          type: "error",
          text: "Database not configured. Set MONGODB_URI first.",
        });
      } else {
        setMessage({
          type: "error",
          text: data?.message || "Failed to save settings",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Network error — try again" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-200 border-t-pink-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Homepage Settings</h2>
        <p className="mt-1 text-sm text-gray-500">
          Control which sections appear on the homepage and edit their content.
        </p>
      </div>

      {message && (
        <div
          className={`rounded-lg border px-4 py-2.5 text-sm ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <section className="rounded-xl border border-pink-100 bg-pink-50/50 p-5">
        <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-800">
          <Megaphone size={18} className="text-pink-600" />
          Top Notice Bar
        </h3>
        <div className="space-y-4">
          <ToggleSwitch
            checked={settings.noticeBar?.isActive ?? true}
            onChange={(v) => update("noticeBar", "isActive", v)}
            label="Show Notice Bar"
            description="Announcement strip at the very top of the page"
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Notice Text
            </label>
            <input
              type="text"
              value={settings.noticeBar?.text || ""}
              onChange={(e) => update("noticeBar", "text", e.target.value)}
              className="w-full rounded-lg border border-pink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Background Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.noticeBar?.bgColor || "#e11d48"}
                onChange={(e) => update("noticeBar", "bgColor", e.target.value)}
                className="h-10 w-14 cursor-pointer rounded border border-pink-200"
              />
              <span className="text-sm text-gray-500">
                {settings.noticeBar?.bgColor || "#e11d48"}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-pink-100 bg-white p-5">
        <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-800">
          <Eye size={18} className="text-pink-600" />
          Section Visibility
        </h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <ToggleSwitch
            checked={settings.heroSection?.isVisible ?? true}
            onChange={(v) => update("heroSection", "isVisible", v)}
            label="Hero Section"
            description="Main banner with headline and CTA"
          />
          <ToggleSwitch
            checked={settings.categoriesSection?.isVisible ?? true}
            onChange={(v) => update("categoriesSection", "isVisible", v)}
            label="Categories Section"
            description="Explore Categories grid"
          />
          <ToggleSwitch
            checked={settings.fashionSection?.isVisible ?? true}
            onChange={(v) => update("fashionSection", "isVisible", v)}
            label="Fashion Collection"
            description="Latest fashion products"
          />
          <ToggleSwitch
            checked={settings.techSection?.isVisible ?? true}
            onChange={(v) => update("techSection", "isVisible", v)}
            label="Tech Collection"
            description="Latest tech products"
          />
          <ToggleSwitch
            checked={settings.bestSellersSection?.isVisible ?? true}
            onChange={(v) => update("bestSellersSection", "isVisible", v)}
            label="Best Sellers"
            description="Featured products grid"
          />
          <ToggleSwitch
            checked={settings.hotOffersSection?.isVisible ?? true}
            onChange={(v) => update("hotOffersSection", "isVisible", v)}
            label="Hot Offers"
            description="Discounted / hot-offer products"
          />
          <ToggleSwitch
            checked={settings.newArrivalsSection?.isVisible ?? true}
            onChange={(v) => update("newArrivalsSection", "isVisible", v)}
            label="New Arrivals"
            description="Latest products by date"
          />
          <ToggleSwitch
            checked={settings.whyChooseUsSection?.isVisible ?? true}
            onChange={(v) => update("whyChooseUsSection", "isVisible", v)}
            label="Why Choose Us"
            description="Trust / value proposition cards"
          />
          <ToggleSwitch
            checked={settings.reviewsSection?.isVisible ?? true}
            onChange={(v) => update("reviewsSection", "isVisible", v)}
            label="Reviews Section"
            description="Customer testimonials"
          />
        </div>
      </section>

      <section className="rounded-xl border border-pink-100 bg-white p-5">
        <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-800">
          <Hash size={18} className="text-pink-600" />
          Max Items per Section
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { key: "categoriesSection", label: "Categories" },
            { key: "fashionSection", label: "Fashion" },
            { key: "techSection", label: "Tech" },
            { key: "hotOffersSection", label: "Hot Offers" },
            { key: "newArrivalsSection", label: "New Arrivals" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {label}
              </label>
              <input
                type="number"
                min={1}
                max={12}
                value={settings[key]?.maxItems ?? 4}
                onChange={(e) =>
                  update(
                    key,
                    "maxItems",
                    Math.min(12, Math.max(1, Number(e.target.value) || 1))
                  )
                }
                className="w-full rounded-lg border border-pink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-pink-100 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-base font-bold text-gray-800">
            <Gift size={18} className="text-pink-600" />
            Promotional Banner
          </h3>
          <ToggleSwitch
            checked={settings.promotionalBanner?.isActive ?? true}
            onChange={(v) => update("promotionalBanner", "isActive", v)}
            label="Active"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={settings.promotionalBanner?.title || ""}
              onChange={(e) => update("promotionalBanner", "title", e.target.value)}
              className="w-full rounded-lg border border-pink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Button Text</label>
            <input
              type="text"
              value={settings.promotionalBanner?.buttonText || ""}
              onChange={(e) => update("promotionalBanner", "buttonText", e.target.value)}
              className="w-full rounded-lg border border-pink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Subtitle</label>
            <textarea
              rows={2}
              value={settings.promotionalBanner?.subtitle || ""}
              onChange={(e) => update("promotionalBanner", "subtitle", e.target.value)}
              className="w-full rounded-lg border border-pink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Button Link</label>
            <input
              type="text"
              value={settings.promotionalBanner?.buttonLink || ""}
              onChange={(e) => update("promotionalBanner", "buttonLink", e.target.value)}
              placeholder="/shop"
              className="w-full rounded-lg border border-pink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div className="sm:col-span-2">
            <ImageUploadField
              value={settings.promotionalBanner?.imageUrl || ""}
              onChange={(url) => update("promotionalBanner", "imageUrl", url)}
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-pink-100 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-base font-bold text-gray-800">
            <Gift size={18} className="text-pink-600" />
            Offer + Promo Code
          </h3>
          <ToggleSwitch
            checked={settings.promoBanner?.isActive ?? true}
            onChange={(v) => update("promoBanner", "isActive", v)}
            label="Active"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={settings.promoBanner?.title || ""}
              onChange={(e) => update("promoBanner", "title", e.target.value)}
              className="w-full rounded-lg border border-pink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Button Text</label>
            <input
              type="text"
              value={settings.promoBanner?.buttonText || ""}
              onChange={(e) => update("promoBanner", "buttonText", e.target.value)}
              className="w-full rounded-lg border border-pink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Subtitle</label>
            <textarea
              rows={2}
              value={settings.promoBanner?.subtitle || ""}
              onChange={(e) => update("promoBanner", "subtitle", e.target.value)}
              className="w-full rounded-lg border border-pink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Button Link</label>
            <input
              type="text"
              value={settings.promoBanner?.buttonLink || ""}
              onChange={(e) => update("promoBanner", "buttonLink", e.target.value)}
              placeholder="/shop?hotOffer=true"
              className="w-full rounded-lg border border-pink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Promo Code</label>
            <input
              type="text"
              value={settings.promoBanner?.couponCode || ""}
              onChange={(e) => update("promoBanner", "couponCode", e.target.value.toUpperCase())}
              placeholder="Empty = latest active coupon"
              className="w-full rounded-lg border border-pink-200 px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Leave blank to use the newest active coupon from Admin → Coupons.
            </p>
          </div>
          <div className="sm:col-span-2">
            <ImageUploadField
              value={settings.promoBanner?.imageUrl || ""}
              onChange={(url) => update("promoBanner", "imageUrl", url)}
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-8 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-pink-700 disabled:opacity-50"
        >
          {saving ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <Save size={16} />
          )}
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
