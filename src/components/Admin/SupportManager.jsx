"use client";

import { useEffect, useState } from "react";
import {
  MessageCircle, Phone, Facebook, Mail, Plus, Pencil, Trash2,
  X, Save, Loader2, Bot, MessageSquareText,
} from "lucide-react";

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100";
const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-[#db2777] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60";
const buttonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-gray-50";

function getError(data, fallback) {
  return data?.message || fallback;
}

export default function SupportManager() {
  const [tab, setTab] = useState("contact");
  const [settings, setSettings] = useState({
    whatsappNumber: "",
    facebookPageUrl: "",
    supportEmail: "",
    isActive: true,
  });
  const [rules, setRules] = useState([]);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [loadingRules, setLoadingRules] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingRule, setSavingRule] = useState(false);
  const [notice, setNotice] = useState(null);
  const [keywords, setKeywords] = useState("");
  const [answer, setAnswer] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [ruleActive, setRuleActive] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/support-settings", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.success) throw new Error(getError(data, "Could not load support settings"));
        if (alive && data.settings) {
          setSettings({
            whatsappNumber: data.settings.whatsappNumber || "",
            facebookPageUrl: data.settings.facebookPageUrl || "",
            supportEmail: data.settings.supportEmail || "",
            isActive: data.settings.isActive ?? true,
          });
        }
      })
      .catch((error) => {
        if (alive) setNotice({ type: "error", text: error.message });
      })
      .finally(() => {
        if (alive) setLoadingSettings(false);
      });
    return () => { alive = false; };
  }, []);

  async function loadRules() {
    setLoadingRules(true);
    try {
      const res = await fetch("/api/chatbot-rules", { cache: "no-store" });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) throw new Error(getError(data, "Could not load chatbot rules"));
      setRules(Array.isArray(data.rules) ? data.rules : []);
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    } finally {
      setLoadingRules(false);
    }
  }

  useEffect(() => {
    if (tab === "rules") loadRules();
  }, [tab]);

  function updateSetting(field, value) {
    setSettings((current) => ({ ...current, [field]: value }));
  }

  async function saveSettings(event) {
    event.preventDefault();
    setSavingSettings(true);
    setNotice(null);
    let facebookPageUrl = settings.facebookPageUrl.trim();
    if (facebookPageUrl && !/^https?:\/\//i.test(facebookPageUrl)) {
      facebookPageUrl = `https://www.facebook.com/${facebookPageUrl.replace(/^@/, "").replace(/^\/+|\/+$/g, "")}`;
    }
    try {
      const res = await fetch("/api/support-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settings, facebookPageUrl }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) throw new Error(getError(data, "Failed to save contact settings"));
      setSettings((current) => ({ ...current, facebookPageUrl }));
      setNotice({ type: "success", text: "Contact settings saved successfully." });
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    } finally {
      setSavingSettings(false);
    }
  }

  function resetRuleForm() {
    setKeywords("");
    setAnswer("");
    setEditingId(null);
  }

  function startEdit(rule) {
    setEditingId(rule._id || rule.id);
    setKeywords((rule.keywords || []).join(", "));
    setAnswer(rule.answer || "");
    setNotice(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submitRule(event) {
    event.preventDefault();
    const parsedKeywords = [...new Set(keywords.split(",").map((word) => word.trim()).filter(Boolean))];
    if (!parsedKeywords.length || !answer.trim()) {
      setNotice({ type: "error", text: "Please enter at least one keyword and an answer." });
      return;
    }
    setSavingRule(true);
    setNotice(null);
    try {
      const res = await fetch(
        editingId ? `/api/chatbot-rules/${encodeURIComponent(editingId)}` : "/api/chatbot-rules",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keywords: parsedKeywords, answer: answer.trim(), isActive: ruleActive }),
        }
      );
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) throw new Error(getError(data, "Failed to save chatbot rule"));
      resetRuleForm();
      setNotice({ type: "success", text: editingId ? "Rule updated successfully." : "New rule added successfully." });
      await loadRules();
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    } finally {
      setSavingRule(false);
    }
  }

  async function deleteRule(rule) {
    const id = rule._id || rule.id;
    if (!id || !window.confirm("Delete this chatbot rule? This action cannot be undone.")) return;
    setNotice(null);
    try {
      const res = await fetch(`/api/chatbot-rules/${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) throw new Error(getError(data, "Failed to delete chatbot rule"));
      setRules((current) => current.filter((item) => (item._id || item.id) !== id));
      if (editingId === id) resetRuleForm();
      setNotice({ type: "success", text: "Rule deleted successfully." });
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-100 text-[#db2777]">
            <MessageCircle size={22} />
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Support Center</h2>
            <p className="text-sm text-slate-500">Manage customer contact channels and Rupshi Bot replies.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        <button type="button" onClick={() => { setTab("contact"); setNotice(null); }} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold ${tab === "contact" ? "bg-pink-600 text-white" : "bg-white text-slate-600 hover:bg-pink-50"}`}>
          <Phone size={16} /> Contact Settings
        </button>
        <button type="button" onClick={() => { setTab("rules"); setNotice(null); }} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold ${tab === "rules" ? "bg-pink-600 text-white" : "bg-white text-slate-600 hover:bg-pink-50"}`}>
          <Bot size={16} /> Rupshi Bot Rules
        </button>
      </div>

      {notice && (
        <div role="status" className={`rounded-lg border px-4 py-3 text-sm ${notice.type === "success" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-700"}`}>
          {notice.text}
        </div>
      )}

      {tab === "contact" ? (
        <form onSubmit={saveSettings} className="space-y-5 rounded-2xl border border-pink-100 bg-white p-4 shadow-sm sm:p-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Customer contact channels</h3>
            <p className="mt-1 text-sm text-slate-500">These details appear in the floating support widget on your store.</p>
          </div>
          {loadingSettings ? (
            <div className="flex items-center gap-2 py-8 text-sm text-slate-500"><Loader2 className="animate-spin" size={18} /> Loading settings…</div>
          ) : (
            <>
              <label className="block">
                <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700"><MessageCircle size={16} className="text-green-600" /> WhatsApp Number</span>
                <input className={inputClass} value={settings.whatsappNumber} onChange={(e) => updateSetting("whatsappNumber", e.target.value)} placeholder="8801XXXXXXXXX" autoComplete="tel" />
                <span className="mt-1 block text-xs text-slate-400">Include country code, e.g. 8801XXXXXXXXX. Do not include spaces or + if possible.</span>
              </label>
              <label className="block">
                <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700"><Facebook size={16} className="text-blue-600" /> Facebook Page Username or URL</span>
                <input className={inputClass} value={settings.facebookPageUrl} onChange={(e) => updateSetting("facebookPageUrl", e.target.value)} placeholder="yourpage or https://facebook.com/yourpage" />
              </label>
              <label className="block">
                <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700"><Mail size={16} className="text-pink-600" /> Support Email</span>
                <input type="email" className={inputClass} value={settings.supportEmail} onChange={(e) => updateSetting("supportEmail", e.target.value)} placeholder="support@example.com" autoComplete="email" />
              </label>
              <label className="flex items-center justify-between gap-4 rounded-xl bg-pink-50 p-4">
                <span><span className="block text-sm font-semibold text-slate-800">Support widget active</span><span className="mt-0.5 block text-xs text-slate-500">Turn off to hide the widget from public pages.</span></span>
                <input type="checkbox" checked={settings.isActive} onChange={(e) => updateSetting("isActive", e.target.checked)} className="h-5 w-5 accent-pink-600" />
              </label>
              <div className="flex justify-end">
                <button type="submit" className={buttonPrimary} disabled={savingSettings || loadingSettings}>{savingSettings ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Contact Settings</button>
              </div>
            </>
          )}
        </form>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <form onSubmit={submitRule} className="h-fit space-y-4 rounded-2xl border border-pink-100 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div><h3 className="font-bold text-slate-900">{editingId ? "Edit chatbot rule" : "Add new rule"}</h3><p className="mt-1 text-xs text-slate-500">Add words customers may use in a question.</p></div>
              {editingId && <button type="button" onClick={resetRuleForm} className="rounded-lg p-2 text-slate-400 hover:bg-gray-100" aria-label="Cancel editing"><X size={18} /></button>}
            </div>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Keywords (comma-separated)</span>
              <input className={inputClass} value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="delivery, shipping, ডেলিভারি" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Bot answer</span>
              <textarea className={inputClass} rows={6} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Write the answer Rupshi Bot should send…" />
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={ruleActive} onChange={(e) => setRuleActive(e.target.checked)} className="h-4 w-4 accent-pink-600" /> Rule is active and available to customers</label>
            <button type="submit" className={`${buttonPrimary} w-full`} disabled={savingRule}>{savingRule ? <Loader2 size={16} className="animate-spin" /> : editingId ? <Save size={16} /> : <Plus size={16} />}{editingId ? "Update Rule" : "Add Rule"}</button>
          </form>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3"><div><h3 className="font-bold text-slate-900">Existing rules</h3><p className="text-xs text-slate-500">{rules.length} active rule{rules.length === 1 ? "" : "s"}</p></div><button type="button" onClick={loadRules} className={buttonSecondary}>Refresh</button></div>
            {loadingRules ? (
              <div className="flex items-center justify-center rounded-xl border border-gray-100 bg-white py-12 text-sm text-slate-500"><Loader2 size={18} className="mr-2 animate-spin" /> Loading rules…</div>
            ) : rules.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-white px-5 py-12 text-center"><MessageSquareText size={28} className="mx-auto text-pink-300" /><p className="mt-3 text-sm font-medium text-slate-700">No active chatbot rules yet</p><p className="mt-1 text-xs text-slate-400">Create your first rule using the form.</p></div>
            ) : rules.map((rule) => (
              <article key={rule._id || rule.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2"><p className="text-xs font-semibold uppercase tracking-wide text-pink-600">Keywords</p><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${rule.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>{rule.isActive ? "Active" : "Inactive"}</span></div>
                    <div className="mt-2 flex flex-wrap gap-1.5">{(rule.keywords || []).map((word) => <span key={word} className="rounded-full bg-pink-50 px-2.5 py-1 text-xs font-medium text-pink-700">{word}</span>)}</div>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Bot answer</p>
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{rule.answer}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button type="button" onClick={() => startEdit(rule)} className="rounded-lg p-2 text-slate-500 hover:bg-pink-50 hover:text-pink-700" aria-label="Edit rule"><Pencil size={17} /></button>
                    <button type="button" onClick={() => deleteRule(rule)} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600" aria-label="Delete rule"><Trash2 size={17} /></button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </div>
      )}
    </div>
  );
}
