import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import API from "../api";

const GREETING = {
  role: "model",
  text: "Hi! I'm the InvestorHub assistant. Ask me about signing up, listings, matches, or payments.",
};

const SUGGESTIONS = [
  "How do I get my account approved?",
  "How does a match request work?",
  "What is the entry fee for?",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef(null);
  const inputRef = useRef(null);

  // Keep the newest message in view as the conversation grows.
  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, sending, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const send = async (text) => {
    const question = (text ?? input).trim();
    if (!question || sending) return;

    // The history sent along is the conversation *before* this question; the
    // greeting is ours, not the model's answer to anything, so it is dropped.
    const history = messages
      .filter((m) => m !== GREETING)
      .map(({ role, text: t }) => ({ role, text: t }));

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setError("");
    setSending(true);

    try {
      const { data } = await API.post("/assistant/chat", { message: question, history });
      setMessages((prev) => [...prev, { role: "model", text: data.reply }]);
    } catch (err) {
      setError(
        err.response?.data?.errors?.[0]?.message ||
          err.response?.data?.message ||
          "Could not reach the assistant. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="InvestorHub assistant"
          className="fixed z-50 bottom-24 right-4 sm:right-6 left-4 sm:left-auto sm:w-[380px] h-[min(520px,calc(100vh-8rem))] flex flex-col bg-white border border-gray-200 rounded-2xl shadow-2xl shadow-slate-900/15 overflow-hidden"
        >
          <div className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shrink-0">
            <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-tight">InvestorHub assistant</p>
              <p className="text-[11px] text-white/80 leading-tight">Answers about the platform</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center"
              aria-label="Close chat"
            >
              <X size={17} />
            </button>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line break-words ${
                    m.role === "user"
                      ? "bg-emerald-600 text-white rounded-br-md"
                      : "bg-white text-slate-700 border border-gray-200 rounded-bl-md"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {messages.length === 1 && !sending && (
              <div className="pt-1 space-y-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="block w-full text-left px-3 py-2 text-[13px] text-slate-600 bg-white border border-gray-200 rounded-xl hover:border-emerald-300 hover:text-emerald-700"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {sending && (
              <div className="flex justify-start">
                <div className="px-3.5 py-3 rounded-2xl rounded-bl-md bg-white border border-gray-200 flex items-center gap-1">
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
          </div>

          <div className="p-3 border-t border-gray-100 bg-white shrink-0">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                maxLength={1000}
                placeholder="Ask about InvestorHub..."
                className="flex-1 max-h-24 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 bg-slate-50 border border-gray-200 rounded-xl outline-none resize-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
              />
              <button
                onClick={() => send()}
                disabled={sending || !input.trim()}
                className="w-10 h-10 shrink-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center disabled:opacity-40 disabled:hover:bg-emerald-600"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="mt-1.5 text-[10px] text-slate-400 text-center">
              AI answers can be wrong — check important details with support.
            </p>
          </div>
        </div>
      )}

      {/* Launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed z-50 bottom-6 right-4 sm:right-6 h-14 pl-4 pr-5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition-transform hover:scale-105"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? <X size={20} /> : <MessageCircle size={20} />}
        <span className="text-sm font-semibold hidden sm:inline">{open ? "Close" : "Ask AI"}</span>
      </button>
    </>
  );
}
