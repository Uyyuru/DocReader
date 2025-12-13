import React, { useState, useEffect } from "react";
import Auth from "./components/Auth";
import Chat from "./components/Chat";
import api from "./api";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // No direct endpoint for current user; rely on localStorage login persistence
    const u = localStorage.getItem("ri_username");
    if (u) setUser(JSON.parse(u));
  }, []);

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="brand">Ready.io — Docs Chat</div>
        <div className="header-right">
          {user ? (
            <div className="pill">Signed in as <strong>{user.username}</strong></div>
          ) : (
            <div className="pill muted">Not signed in</div>
          )}
        </div>
      </header>

      <main className="app-main">
        {!user ? (
          <Auth onLogin={(u) => { setUser(u); localStorage.setItem('ri_username', JSON.stringify(u)); }} />
        ) : (
          <Chat user={user} onSignOut={() => { setUser(null); localStorage.removeItem('ri_username'); }} />
        )}
      </main>

      <footer className="app-footer">Built with your backend — Frontend (React)</footer>
    </div>
  );
}
