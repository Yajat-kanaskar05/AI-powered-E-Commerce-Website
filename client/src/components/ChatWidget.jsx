import { useState, useRef, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (!user) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMessage = { role: "user", text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const { data } = await api.post("/chat", { message: text, history: newMessages });
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply, sources: data.sources }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: err.response?.data?.message || "Something went wrong, please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-panel">
          <div className="chat-header">
            <span>Support Assistant</span>
            <button onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="chat-body">
            {messages.length === 0 && (
              <p className="chat-empty">Ask me about shipping, returns, payments, or your account.</p>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-msg ${msg.role}`}>
                <div className="chat-bubble">{msg.text}</div>
                {msg.sources && msg.sources.length > 0 && (
                  <p className="chat-sources">Sources: {msg.sources.join(", ")}</p>
                )}
              </div>
            ))}

            {loading && <p className="chat-typing">Typing...</p>}
            <div ref={scrollRef} />
          </div>

          <form onSubmit={handleSend} className="chat-form">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." />
            <button type="submit" disabled={loading}>Send</button>
          </form>
        </div>
      )}

      <button className="chat-toggle" onClick={() => setOpen((o) => !o)}>💬</button>
    </div>
  );
}