import React, { useMemo } from 'react';

// PUBLIC_INTERFACE
export default function NoteEditor({ note, onChange, onSave, saving, error }) {
  const tags = useMemo(() => (note.tags || []).join(', '), [note.tags]);

  return (
    <div aria-label="Editor container">
      {error && (
        <div role="alert" style={{ color: 'var(--error)' }}>
          {String(error)}
        </div>
      )}
      <label htmlFor="title" className="visually-hidden">Title</label>
      <input
        id="title"
        className="editor-title"
        value={note.title || ''}
        placeholder="Title"
        onChange={(e) => onChange({ ...note, title: e.target.value })}
      />
      <label htmlFor="content" className="visually-hidden">Content</label>
      <textarea
        id="content"
        className="editor-content"
        value={note.content || ''}
        placeholder="Start typing your note…"
        onChange={(e) => onChange({ ...note, content: e.target.value })}
        aria-label="Note content"
      />
      <div className="tags" aria-label="Tags">
        {(note.tags || []).map((t, i) => (
          <span key={`${t}-${i}`} className="tag">#{t}</span>
        ))}
      </div>
      <div style={{ marginTop: 8 }}>
        <label htmlFor="tags-input" className="visually-hidden">Tags (comma separated)</label>
        <input
          id="tags-input"
          className="editor-title"
          placeholder="tags: work, ideas, personal"
          value={tags}
          onChange={(e) => {
            const split = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
            onChange({ ...note, tags: split });
          }}
          aria-label="Tags input"
        />
      </div>
      <div className="editor-actions">
        <button className="btn secondary" onClick={onSave} aria-label="Save note">
          {saving ? 'Saving…' : 'Save (⌘/Ctrl+S)'}
        </button>
      </div>
    </div>
  );
}
