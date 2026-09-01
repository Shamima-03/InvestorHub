import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Search, Send, MessageCircle } from "lucide-react";
import API, { connectSocket, getSocket } from "../api";

function formatTime(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatPage() {
  const { user } = useSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [query, setQuery] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const messagesEnd = useRef(null);
  const activeRef = useRef(null);
  const openedFromQuery = useRef(false);

  const getOther = (conv) => conv?.participants?.find((p) => String(p._id) !== String(user?._id));

  useEffect(() => {
    activeRef.current = activeConv;
  }, [activeConv]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) connectSocket(token);

    API.get("/conversations")
      .then((res) => setConversations(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoadingList(false));

    const socket = getSocket();
    if (socket) {
      socket.on("new_message", (msg) => {
        const cid = msg.conversationId;
        setConversations((prev) => {
          const next = prev.map((c) =>
            c._id === cid ? { ...c, lastMessage: msg.text, updatedAt: new Date().toISOString() } : c
          );
          next.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
          return next;
        });
        if (activeRef.current?._id === cid) {
          setMessages((prev) => (prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]));
        }
      });

      socket.on("user_typing", (data) => {
        if (data.conversationId === activeRef.current?._id) setTyping(true);
      });

      socket.on("user_stop_typing", (data) => {
        if (!data?.conversationId || data.conversationId === activeRef.current?._id) setTyping(false);
      });
    }

    return () => {
      const s = getSocket();
      if (s) {
        s.off("new_message");
        s.off("user_typing");
        s.off("user_stop_typing");
      }
    };
  }, []);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const openChat = async (conv) => {
    if (!conv) return;
    setActiveConv(conv);
    setTyping(false);
    setLoadingMsgs(true);
    const socket = getSocket();
    if (socket) socket.emit("join_conversation", conv._id);

    try {
      const res = await API.get(`/conversations/${conv._id}/messages`);
      setMessages(res.data.data || []);
      socket?.emit("mark_seen", conv._id);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMsgs(false);
    }
  };

  useEffect(() => {
    const cid = searchParams.get("c");
    if (!cid || openedFromQuery.current || conversations.length === 0) return;
    const conv = conversations.find((c) => c._id === cid);
    if (conv) {
      openedFromQuery.current = true;
      openChat(conv);
    }
  }, [conversations, searchParams]);

  const sendMessage = () => {
    if (!text.trim() || !activeConv) return;
    const socket = getSocket();
    socket?.emit("send_message", { conversationId: activeConv._id, text: text.trim() });
    setText("");
    socket?.emit("stop_typing", activeConv._id);
  };

  const handleTyping = () => {
    const socket = getSocket();
    if (activeConv) socket?.emit("typing", activeConv._id);
    setTimeout(() => socket?.emit("stop_typing", activeConv?._id), 2000);
  };

  const filtered = conversations.filter((conv) => {
    const name = getOther(conv)?.name || "";
    return name.toLowerCase().includes(query.toLowerCase());
  });

  const other = getOther(activeConv);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="shrink-0 mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Inbox</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">Messages</h1>
      </div>

      <div className="flex-1 min-h-0 bg-white border border-gray-200 rounded-xl overflow-hidden flex">
        <div className="w-72 lg:w-80 border-r border-gray-200 flex flex-col shrink-0">
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center bg-slate-50 border border-gray-200 rounded-lg px-3 h-9 gap-2">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search chats..."
                className="bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none w-full"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingList ? (
              <p className="text-sm text-slate-400 p-4">Loading...</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-slate-400 p-4">No conversations yet</p>
            ) : (
              filtered.map((conv) => {
                const person = getOther(conv);
                const active = activeConv?._id === conv._id;
                return (
                  <button
                    key={conv._id}
                    onClick={() => openChat(conv)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 border-l-2 ${
                      active
                        ? "bg-emerald-50/70 border-emerald-600"
                        : "border-transparent hover:bg-slate-50"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-sm font-semibold shrink-0">
                      {person?.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-900 truncate">{person?.name || "Unknown"}</p>
                      <p className="text-xs text-slate-400 truncate">{conv.lastMessage || "No messages yet"}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          {activeConv ? (
            <>
              <div className="h-16 px-4 border-b border-gray-100 flex items-center gap-3 shrink-0">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-sm font-semibold">
                  {other?.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{other?.name || "Unknown"}</p>
                  <p className="text-xs text-slate-400 capitalize">
                    {typing ? "Typing..." : other?.role === "businessman" ? "Business" : other?.role || ""}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                {loadingMsgs ? (
                  <p className="text-sm text-slate-400 text-center py-8">Loading messages...</p>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">No messages yet. Say hello.</p>
                ) : (
                  messages.map((msg) => {
                    // senderId can be a populated object (REST/socket) or a raw id string —
                    // normalize both sides so the sender's bubbles always stay on the right
                    const senderId = String(msg.senderId?._id ?? msg.senderId ?? "");
                    const mine = senderId !== "" && senderId === String(user?._id ?? "");
                    return (
                      <div key={msg._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm ${
                            mine
                              ? "bg-emerald-600 text-white rounded-br-md"
                              : "bg-white border border-gray-200 text-slate-800 rounded-bl-md"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                          <p className={`text-[10px] mt-1 ${mine ? "text-white/70" : "text-slate-400"}`}>
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                {typing && (
                  <p className="text-xs text-slate-400 px-1">Typing...</p>
                )}
                <div ref={messagesEnd} />
              </div>

              <div className="p-3 border-t border-gray-100 flex items-center gap-2 shrink-0">
                <input
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    handleTyping();
                  }}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  className="flex-1 h-11 px-3.5 text-sm text-slate-800 placeholder-slate-400 bg-slate-50 border border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Type a message..."
                />
                <button
                  onClick={sendMessage}
                  disabled={!text.trim()}
                  className="h-11 w-11 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center disabled:opacity-40"
                >
                  <Send size={16} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                <MessageCircle size={22} />
              </div>
              <p className="font-medium text-slate-800">Select a conversation</p>
              <p className="mt-1 text-sm text-slate-500">Choose a chat from the left to start messaging.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
