import React from 'react';

// PUBLIC_INTERFACE
export default function Sidebar({ notes, activeId, onSelect, onPin, onDelete, loading, error }) {
  return (
    <aside className="sidebar" aria-label="Notes list">
      <div className="sidebar-header">
        <span>Notes</span>
        <span className="helper">{loading ? 'Loading…' : `${notes.length} items`}</span>
      </div>
      {error && (
        <div role="alert" style={{ color: 'var(--error)', padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
          {String(error)}
        </div>
      )}
      <ul className="note-list" role="list">
        {notes.map(n => (
          <li
            key={n.id}
            className={`note-item ${n.id === activeId ? 'active' : ''}`}
            onClick={() => onSelect(n.id)}
            role="listitem"
            aria-current={n.id === activeId ? 'true' : 'false'}
          >
            <div>
              <div className="title-line">
                {n.title?.trim() || 'Untitled'}
              </div>
              <div className="preview">{n.content?.trim().slice(0, 80) || 'No content yet'}</div>
              <div className="note-meta">
                {n.pinned ? <span className="pin" title="Pinned" aria-label="Pinned">📌</span> : null}
                <span className="time" aria-label="Last updated">
                  {formatTime(n.updatedAt || n.createdAt)}
                </span>
                {n.tags?.length ? <span className="helper">{n.tags.length} tag(s)</span> : null}
              </div>
            </div>
            <div aria-label="Row actions">
              <button
                className="icon-btn"
                onClick={(e) => { e.stopPropagation(); onPin(n.id); }}
                aria-label={n.pinned ? 'Unpin note' : 'Pin note'}
                title={n.pinned ? 'Unpin' : 'Pin'}
              >
                {n.pinned ? '📌' : '📍'}
              </button>
              <button
                className="icon-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Delete this note? This cannot be undone.')) {
                    onDelete(n.id);
                  }
                }}
                aria-label="Delete note"
                title="Delete"
              >
                🗑️
              </button>
            </div>
          </li>
        ))}
        {!notes.length && !loading && (
          <li className="note-item" role="listitem" aria-disabled="true">
            <div>No notes found</div>
          </li>
        )}
      </ul>
    </aside>
  );
}

function formatTime(ts) {
  try {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString();
  } catch {
    return '—';
  }
}
