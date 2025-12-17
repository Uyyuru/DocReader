import React, { useState, useEffect, useRef } from "react";
import api from "../api";
import UploadArea from "./UploadArea";
import History from "./History";

export default function Chat({ user, onSignOut }) {
  const messagesKey = `ri_messages_${user.email}`;
  const historyKey = `ri_history_${user.email}`;

  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState(() =>
    JSON.parse(localStorage.getItem(messagesKey) || "[]")
  );
  const [history, setHistory] = useState(() =>
    JSON.parse(localStorage.getItem(historyKey) || "[]")
  );
  const [sending, setSending] = useState(false);
  const [files, setFiles] = useState([]);
  const [filesError, setFilesError] = useState(null);

  const listRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(messagesKey, JSON.stringify(messages));
  }, [messages, messagesKey]);

  useEffect(() => {
    localStorage.setItem(historyKey, JSON.stringify(history));
  }, [history, historyKey]);

  const fetchFiles = async () => {
    try {
      const res = await api.get("/docs");
      setFiles(res.data || []);
      setFilesError(null);
    } catch (err) {
      setFilesError("Failed to fetch uploaded files");
      setFiles([]);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const send = async () => {
    if (!query.trim() || sending) return;

    const userMsg = { role: "user", text: query, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setSending(true);

    try {
      const res = await api.post("/chat", { query });
      const answer = res.data.answer || "No response";

      const botMsg = { role: "bot", text: answer, ts: Date.now() };
      setMessages((m) => [...m, botMsg]);

      setHistory((h) => [
        { question: query, answer, ts: Date.now() },
        ...h
      ].slice(0, 50));
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "bot", text: "Something went wrong", ts: Date.now() }
      ]);
    } finally {
      setQuery("");
      setSending(false);
      setTimeout(() => {
        listRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const startNewChat = () => {
    setMessages([]);
  };

  const logout = () => {
    setMessages([]);
    setHistory([]);
    onSignOut();
  };

  return (
    <div className="chat-layout">
      <aside className="chat-side">
        <div className="side-top">
          <div className="side-title">Your Activity</div>
          <div className="side-actions">
            <button className="btn" onClick={startNewChat}>
              New Chat
            </button>
            <button
              className="btn"
              onClick={() => {
                localStorage.removeItem(historyKey);
                setHistory([]);
              }}
            >
              Clear History
            </button>
            <button className="btn" onClick={logout}>
              Sign Out
            </button>
          </div>
        </div>

        <History
          items={history}
          onSelect={(h) =>
            setMessages([
              { role: "user", text: h.question, ts: Date.now() },
              { role: "bot", text: h.answer, ts: Date.now() }
            ])
          }
        />
      </aside>

      <section className="chat-main">
        <div className="chat-top">
          <UploadArea onUploaded={fetchFiles} />
          <div className="files-muted">
            Uploaded files: {files.length ? files.join(", ") : "—"}
          </div>
          {filesError && <div className="error">{filesError}</div>}
        </div>

        <div className="messages">
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              <div className="msg-text">{m.text}</div>
              <div className="msg-time">
                {new Date(m.ts).toLocaleTimeString()}
              </div>
            </div>
          ))}
          <div ref={listRef} />
        </div>

        <div className="chat-input">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask something..."
          />
          <div className="input-actions">
            <button className="btn" onClick={() => setQuery("")}>
              Clear
            </button>
            <button
              className="btn primary"
              onClick={send}
              disabled={sending}
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
