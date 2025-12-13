# Ready.io Frontend

This is a small React + Vite frontend that pairs with your existing backend (no backend changes required). It provides:
- Login / Signup (uses `/api/auth`)
- Upload documents (PDF/TXT/MD/HTML) to `/api/docs/upload`
- Ask questions about uploaded documents using `/api/chat`
- A right-side local history panel (stored in browser `localStorage`)

Important: the backend in this workspace listens on port `5000`. The backend's CORS config allows requests from `http://localhost:3000`, so the frontend runs on port `3000` in dev.

Quick start

1. Install dependencies for frontend

```pwsh
cd frontend
npm install
```

2. Run frontend

```pwsh
npm run dev
```

3. Make sure your backend is running (from repository root):

```pwsh
cd ..\backend
npm install
node server.js
```

Notes
- Requests to protected endpoints include credentials (cookies). Login stores the server cookie; the frontend sends `withCredentials`.
- Chat history displayed in the right panel is saved locally; backend does persist history but it doesn't expose a read endpoint, so frontend keeps a local copy for the UI.
