import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { api } from "../services/api";

export default function ChatPanel({ session, setSession, refreshSessions }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!message.trim() || loading) return;

    const userMessage = message;
    setMessage("");

    try {
      setLoading(true);
      await api.chat(session.id, userMessage);
      const updated = await api.getSession(session.id);
      setSession(updated);
      await refreshSessions();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      sendMessage();
    }
  }

  return (
    <div className="chat-card">
      <div className="card-header">
        <div className="card-icon blue">
          <MessageCircle size={14} />
        </div>
        <h3>Chat</h3>
      </div>

      <div className="messages">
        {(!session.messages || session.messages.length === 0) && (
          <div className="messages-empty">
            Ask a question or continue the story…
          </div>
        )}
        {session.messages?.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <div className="message-role">{msg.role === "user" ? "You" : "FaunaMind"}</div>
            <div className="message-content">{msg.content}</div>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Continue the story, ask a question… (⌘↵ to send)"
          disabled={loading}
        />
        <div className="chat-actions">
          <button
            className="btn btn-primary"
            onClick={sendMessage}
            disabled={loading || !message.trim()}
          >
            <Send size={13} />
            {loading ? "Sending…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
