import React from "react";

export default function History({ items = [], onSelect }) {
  return (
    <div className="history-card">
      <div className="history-header">History</div>

      <div className="history-list">
        {items.length === 0 && (
          <div className="muted">No history yet</div>
        )}

        {items.map((h, idx) => (
          <div
            key={idx}
            className="history-item"
            onClick={() => onSelect(h)}
          >
            <div className="q">Q: {h.question}</div>
            <div className="meta">
              {new Date(h.ts).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
