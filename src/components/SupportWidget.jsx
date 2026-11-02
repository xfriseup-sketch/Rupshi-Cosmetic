"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Facebook, Phone, Bot, Mail } from "lucide-react";

const GREETING = "নমস্কার! 👋 আমি রূপশী। কীভাবে সাহায্য করতে পারি?";
const FALLBACK = "দুঃখিত, আমি এই প্রশ্নের উত্তর জানি না। 😅 অনুগ্রহ করে হোয়াটসঅ্যাপে মেসেজ দিন।";

function cleanPhone(value = "") {
  return String(value).replace(/[^\d]/g, "");
}

function facebookUsername(value = "") {
  const raw = String(value).trim();
  if (!raw) return "";
  if (!/^https?:\/\//i.test(raw)) return raw.replace(/^@/, "").replace(/^\/+|\/+$/g, "");
  try {
    const url = new URL(raw);
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] === "profile.php") return url.searchParams.get("id") || "";
    return parts[0] === "pages" ? parts[parts.length - 1] : (parts[0] || "");
  } catch {
    return "";
  }
}

export default function SupportWidget() {
  const [settings, setSettings] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [rules, setRules] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loadingRules, setLoadingRules] = useState(false);
  const [rulesLoaded, setRulesLoaded] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/support-settings", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (alive && data?.success) setSettings(data.settings || {});
      })
      .catch(() => {
        if (alive) setSettings({ isActive: true });
      });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatOpen]);

  async function openChat() {
    setMenuOpen(false);
    setChatOpen(true);
    if (messages.length === 0) setMessages([{ role: "bot", text: GREETING }]);
    if (rulesLoaded || loadingRules) return;
    setLoadingRules(true);
    try {
      const res = await fetch("/api/chatbot-rules", { cache: "no-store" });
      const data = await res.json().catch(() => null);
      setRules(res.ok && data?.success && Array.isArray(data.rules) ? data.rules : []);
    } catch {
      setRules([]);
    } finally {
      setRulesLoaded(true);
      setLoadingRules(false);
    }
  }

  function sendMessage(event) {
    event.preventDefault();
    const question = message.trim();
    if (!question) return;
    const normalized = question.toLocaleLowerCase();
    const matched = rules.find((rule) =>
      (rule.keywords || []).some((keyword) => {
        const term = String(keyword).trim().toLocaleLowerCase();
        return term && normalized.includes(term);
      })
    );
    const reply = matched?.answer || FALLBACK;
    setMessages((current) => [
      ...current,
      { role: "user", text: question },
      { role: "bot", text: reply },
    ]);
    setMessage("");
  }

  if (settings && settings.isActive === false) return null;
  const phone = cleanPhone(settings?.whatsappNumber);
  const fbUser = facebookUsername(settings?.facebookPageUrl);
  const whatsappHref = phone ? `https://wa.me/${phone}` : "";
  const messengerHref = fbUser ? `https://m.me/${encodeURIComponent(fbUser)}` : "";

  return (
    <div className="fixed bottom-5 right-4 z-[80] sm:bottom-6 sm:right-6">
      {menuOpen && !chatOpen && (
        <div className="mb-3 w-[min(19rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-2xl shadow-pink-900/15">
          <div className="bg-[#db2777] px-4 py-3 text-white">
            <p className="font-semibold">কীভাবে সাহায্য করতে পারি?</p>
            <p className="mt-0.5 text-xs text-pink-100">Rupshi Customer Support</p>
          </div>
          <div className="space-y-1 p-2">
            {whatsappHref ? (
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-green-50"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-700"><Phone size={18} /></span><span>WhatsApp <span className="block text-xs font-normal text-slate-400">Chat with us directly</span></span></a>
            ) : (
              <div className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100"><Phone size={18} /></span><span>WhatsApp <span className="block text-xs">Not configured yet</span></span></div>
            )}
            {messengerHref ? (
              <a href={messengerHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-blue-50"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700"><Facebook size={18} /></span><span>Facebook Messenger <span className="block text-xs font-normal text-slate-400">Send us a message</span></span></a>
            ) : (
              <div className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100"><Facebook size={18} /></span><span>Facebook Messenger <span className="block text-xs">Not configured yet</span></span></div>
            )}
            <button type="button" onClick={openChat} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 hover:bg-pink-50"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-100 text-[#db2777]"><Bot size={18} /></span><span>Live Chat (Rupshi) <span className="block text-xs font-normal text-slate-400">Ask our automatic assistant</span></span></button>
            {settings?.supportEmail && <a href={`mailto:${settings.supportEmail}`} className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs text-slate-500 hover:bg-pink-50"><Mail size={15} />{settings.supportEmail}</a>}
          </div>
        </div>
      )}

      {chatOpen && (
        <section role="dialog" aria-label="Rupshi live chat" className="fixed inset-0 z-[90] flex flex-col bg-white shadow-2xl sm:absolute sm:inset-auto sm:bottom-0 sm:right-0 sm:h-[min(34rem,calc(100dvh-7rem))] sm:w-[min(23rem,calc(100vw-2rem))] sm:overflow-hidden sm:rounded-2xl sm:border sm:border-pink-100">
          <header className="flex items-center justify-between bg-[#db2777] px-4 py-3 text-white">
            <div className="flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15"><Bot size={20} /></span><div><p className="text-sm font-bold">Rupshi Assistant</p><p className="text-[11px] text-pink-100">We are here to help</p></div></div>
            <button type="button" onClick={() => setChatOpen(false)} className="rounded-full p-2 hover:bg-white/15" aria-label="Close chat"><X size={19} /></button>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto bg-[#fff9fc] p-4">
            {messages.map((item, index) => (
              <div key={index} className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${item.role === "user" ? "rounded-br-md bg-[#db2777] text-white" : "rounded-bl-md border border-pink-100 bg-white text-slate-700 shadow-sm"}`}>{item.text}</div>
              </div>
            ))}
            {loadingRules && <p className="text-center text-xs text-slate-400">Rupshi is getting ready…</p>}
            <div ref={endRef} />
          </div>
          <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-pink-100 bg-white p-3">
            <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="আপনার প্রশ্ন লিখুন…" aria-label="Your message" className="min-w-0 flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100" />
            <button type="submit" disabled={!message.trim()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#db2777] text-white hover:bg-pink-700 disabled:opacity-40" aria-label="Send message"><Send size={17} /></button>
          </form>
        </section>
      )}

      <button type="button" onClick={() => { if (chatOpen) { setChatOpen(false); return; } setMenuOpen((open) => !open); }} aria-label={menuOpen || chatOpen ? "Close support" : "Open support"} aria-expanded={menuOpen || chatOpen} className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#db2777] text-white shadow-lg shadow-pink-700/30 transition hover:scale-105 hover:bg-pink-700 focus:outline-none focus:ring-4 focus:ring-pink-200">
        {menuOpen || chatOpen ? <X size={25} /> : <MessageCircle size={26} />}
      </button>
    </div>
  );
}
