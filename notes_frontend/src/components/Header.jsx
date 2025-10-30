import React, { useMemo } from 'react';

/**
 * Header with brand, search, add button, and theme toggle.
 * Accessible labels and roles included.
 */
// PUBLIC_INTERFACE
export default function Header({ query, onQueryChange, onAddNote, isSaving, theme, onToggleTheme }) {
  /** 300ms debounced search change handled via parent; this component only emits raw input */
  const savingText = useMemo(() => (isSaving ? 'Saving…' : ''), [isSaving]);

  return (
    <header className="header" role="banner" aria-label="Application header">
      <div className="header-inner">
        <div className="brand" aria-label="Brand">
          <span className="dot" aria-hidden="true" />
          <span>Ocean Notes</span>
          {savingText && <span className="helper" role="status" aria-live="polite">{savingText}</span>}
        </div>

        <div className="search" role="search">
          <label htmlFor="search-input" className="visually-hidden">Search notes</label>
          <input
            id="search-input"
            type="search"
            placeholder="Search notes…"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            aria-label="Search notes"
          />
        </div>

        <div className="header-actions">
          <button className="btn" onClick={onAddNote} aria-label="Add new note">
            + New Note
          </button>
          <button
            className="icon-btn"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            onClick={onToggleTheme}
            title="Toggle theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    </header>
  );
}
