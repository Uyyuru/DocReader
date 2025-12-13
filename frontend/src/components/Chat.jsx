import React, { useState, useEffect, useRef } from "react";
import api from "../api";
import UploadArea from "./UploadArea";
import History from "./History";

export default function Chat({ user, onSignOut }) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState(() => {
    return JSON.parse(localStorage.getItem('ri_messages') || '[]');
  });
  const [history, setHistory] = useState(() => {
    return JSON.parse(localStorage.getItem('ri_history') || '[]');
  });
  const [sending, setSending] = useState(false);
  const [files, setFiles] = useState([]);
  const [filesError, setFilesError] = useState(null);
  const listRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('ri_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('ri_history', JSON.stringify(history));
  }, [history]);

  const fetchFiles = async () => {
    try {
      const res = await api.get('/docs');
      setFilesError(null);
      setFiles(res.data || []);
    } catch (err) {
      // Surface error to the UI so user knows if auth failed
      if (err?.response?.status === 401) {
        setFilesError('Not authenticated. Please log in to see your uploaded documents.');
      } else {
        setFilesError(err?.response?.data?.error || err.message || 'Failed to fetch files');
      }
      setFiles([]);
    }
  };

  useEffect(() => { fetchFiles(); }, []);

  const send = async () => {
    if (!query || sending) return;
    const userQ = { role: 'user', text: query, ts: Date.now() };
    setMessages((m) => [...m, userQ]);
    setSending(true);
    try {
      const res = await api.post('/chat', { query });
      const answer = res.data.answer || res.data?.data || 'No answer';
      const bot = { role: 'bot', text: answer, ts: Date.now() };
      setMessages((m) => [...m, bot]);

      const histItem = { question: query, answer, ts: Date.now(), references: res.data.references || [] };
      setHistory((h) => [histItem, ...h].slice(0, 50));
    } catch (err) {
      const bot = { role: 'bot', text: err?.response?.data?.error || err.message, ts: Date.now() };
      setMessages((m) => [...m, bot]);
    } finally {
      setSending(false);
      setQuery('');
      setTimeout(() => listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 100);
    }
  };

  const handleKey = (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.shiftKey === false)) { e.preventDefault(); send(); } };

  return (
    <div className="chat-layout">
      <aside className="chat-side">
        <div className="side-top">
          <div className="side-title">Your Activity</div>
          <div className="side-actions">
            <button className="btn" onClick={() => { localStorage.removeItem('ri_history'); setHistory([]); }}>Clear</button>
            <button className="btn" onClick={() => { onSignOut(); }}>Sign out</button>
          </div>
        </div>
        <History items={history} onSelect={(h) => { setMessages((m) => [...m, { role: 'user', text: h.question, ts: Date.now() }, { role: 'bot', text: h.answer, ts: Date.now() }]); }} />
      </aside>

      <section className="chat-main">
        <div className="chat-top">
          <UploadArea onUploaded={fetchFiles} />
          <div className="files-muted">Uploaded files: {files.length === 0 ? '—' : files.join(', ')}</div>
          {filesError && <div className="error" style={{marginTop:8}}>{filesError}</div>}
          {!filesError && files.length === 0 && (
            <div className="muted" style={{marginTop:8}}>
              No uploaded documents found for this account. Make sure you uploaded a text/PDF resume (not a scanned image) and that you're logged in.
            </div>
          )}
        </div>

        <div className="messages">
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}> 
              <div className="msg-text">{m.text}</div>
              <div className="msg-time">{new Date(m.ts).toLocaleTimeString()}</div>
            </div>
          ))}
          <div ref={listRef} />
        </div>

        <div className="chat-input">
          <textarea value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKey} placeholder="Ask a question about your uploaded documents..." />
          <div className="input-actions">
            <button className="btn" onClick={() => { setQuery(''); }}>Clear</button>
            <button className="btn primary" onClick={send} disabled={sending}>{sending ? 'Sending...' : 'Send'}</button>
          </div>
        </div>
      </section>
    </div>
  );
}
