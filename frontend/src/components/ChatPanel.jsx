import { useState } from "react";

import { api } from "../services/api";

export default function ChatPanel({ session, setSession, refreshSessions }) {
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!message.trim()) return;

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

  return (
    <div className="chat-card">
      <h3>Chat</h3>

      <div className="messages">
        {session.messages?.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <div className="message-role">{msg.role}</div>

            <div className="message-content">{msg.content}</div>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Continue the story, ask a question, or finish the story..."
        />

        <button onClick={sendMessage} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}
