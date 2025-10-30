import React from 'react';

// PUBLIC_INTERFACE
export default function EmptyState({ onCreate }) {
  return (
    <div className="empty" role="region" aria-label="Empty state">
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>No note selected</div>
        <div>Choose a note from the list or create a new one.</div>
        <div className="cta">
          <button className="btn" onClick={onCreate} aria-label="Create a new note">+ New Note (⌘/Ctrl+N)</button>
        </div>
      </div>
    </div>
  );
}
