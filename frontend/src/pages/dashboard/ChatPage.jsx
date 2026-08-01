import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import API from "../../services/api";
import { connectSocket, getSocket } from "../../services/socket";

export default function ChatPage() {
  const { user } = useSelector((state) => state.auth);
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEnd = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) connectSocket(token);

    API.get("/conversations")
      .then((res) => setConversations(res.data.data))
      .catch(() => {});

    const socket = getSocket();
    if (socket) {
      socket.on("new_message", (msg) => {
        setMessages((prev) => [...prev, msg]);
      });

      socket.on("user_typing", (data) => {
        if (data.conversationId === activeConv?._id) setTyping(true);
      });

      socket.on("user_stop_typing", () => setTyping(false));
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
  }, [messages]);

  const openChat = async (conv) => {
    setActiveConv(conv);
    const socket = getSocket();
    if (socket) socket.emit("join_conversation", conv._id);

    try {
      const res = await API.get(`/conversations/${conv._id}/messages`);
      setMessages(res.data.data);
      socket?.emit("mark_seen", conv._id);
    } catch {}
  };

  const sendMessage = () => {
    if (!text.trim() || !activeConv) return;
    const socket = getSocket();
    socket?.emit("send_message", { conversationId: activeConv._id, text: text.trim() });
    setText("");
  };

  const handleTyping = () => {
    const socket = getSocket();
    if (activeConv) socket?.emit("typing", activeConv._id);
    setTimeout(() => socket?.emit("stop_typing", activeConv?._id), 2000);
  };

  const getOtherName = (conv) => {
    const other = conv.participants?.find((p) => p._id !== user?._id);
    return other?.name || "Unknown";
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] bg-white rounded-lg shadow overflow-hidden">
      <div className="w-80 border-r overflow-y-auto">
        <div className="p-4 border-b font-semibold">Chats</div>
        {conversations.length === 0 ? (
          <p className="text-sm text-gray-400 p-4">No conversations yet</p>
        ) : (
          conversations.map((conv) => {
            const other = conv.participants?.find((p) => p._id !== user?._id);
            return (
              <button
                key={conv._id}
                onClick={() => openChat(conv)}
                className={`w-full text-left p-4 border-b hover:bg-gray-50 flex items-center gap-3 ${activeConv?._id === conv._id ? "bg-green-50" : ""}`}
              >
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-sm">
                  {other?.name?.charAt(0) || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{other?.name}</p>
                  <p className="text-xs text-gray-400 truncate">{conv.lastMessage || "No messages"}</p>
                </div>
              </button>
            );
          })
        )}
      </div>

      <div className="flex-1 flex flex-col">
        {activeConv ? (
          <>
            <div className="p-4 border-b font-semibold">{getOtherName(activeConv)}</div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${msg.senderId?._id === user?._id ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                    msg.senderId?._id === user?._id ? "bg-green-400 text-white" : "bg-gray-100"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {typing && <p className="text-xs text-gray-400">Typing...</p>}
              <div ref={messagesEnd} />
            </div>
            <div className="p-4 border-t flex gap-2">
              <input
                value={text}
                onChange={(e) => { setText(e.target.value); handleTyping(); }}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1 border rounded-lg px-4 py-2"
                placeholder="Type a message..."
              />
              <button onClick={sendMessage} className="bg-green-400 text-white px-6 py-2 rounded-lg hover:bg-green-500">
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
