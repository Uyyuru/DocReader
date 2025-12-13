import React, { useState } from "react";
import api from "../api";

export default function Auth({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.post("/auth/login", { email, password });
      onLogin({ username: res.data.username, email });
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/auth/signup", { username, email, password });
      setTab("login");
      setError("Signup successful. Please log in.");
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    }
  };

  return (
    <div className="auth-card">
      <div className="tabs">
        <button className={tab === 'login' ? 'active' : ''} onClick={() => setTab('login')}>Login</button>
        <button className={tab === 'signup' ? 'active' : ''} onClick={() => setTab('signup')}>Sign Up</button>
      </div>

      {tab === 'login' ? (
        <form className="auth-form" onSubmit={handleLogin}>
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button className="btn primary" type="submit">Login</button>
          {error && <div className="error">{error}</div>}
        </form>
      ) : (
        <form className="auth-form" onSubmit={handleSignup}>
          <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button className="btn primary" type="submit">Create Account</button>
          {error && <div className="error">{error}</div>}
        </form>
      )}
    </div>
  );
}
