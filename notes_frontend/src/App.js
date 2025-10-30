import React, { useEffect, useCallback } from 'react';
import './App.css';
import './index.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import NoteEditor from './components/NoteEditor';
import EmptyState from './components/EmptyState';
import { NotesProvider, useNotes } from './state/store';

// PUBLIC_INTERFACE
function AppShell() {
  /**
   * This component renders the layout and binds global shortcuts.
   * It consumes state/actions from the Notes store.
   */
  const {
    state,
    actions,
  } = useNotes();

  // Fetch notes on mount
  useEffect(() => {
    actions.fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard shortcuts: Cmd/Ctrl+S to save, Cmd/Ctrl+N to create
  const handleKeyDown = useCallback(
    (e) => {
      const isSave = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's';
      const isNew = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n';

      if (isSave) {
        e.preventDefault();
        if (state.activeNoteId) {
          const note = state.notes.find(n => n.id === state.activeNoteId);
          if (note) {
            actions.saveNoteImmediate(note);
          }
        }
      }
      if (isNew) {
        e.preventDefault();
        actions.createNote();
      }
    },
    [actions, state.activeNoteId, state.notes]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const activeNote = state.notes.find(n => n.id === state.activeNoteId) || null;

  return (
    <div className="app-root" role="application" aria-label="Notes application">
      <Header
        query={state.query}
        onQueryChange={actions.setQuery}
        onAddNote={actions.createNote}
        isSaving={state.saving}
        theme={state.theme}
        onToggleTheme={actions.toggleTheme}
      />
      <div className="layout">
        <Sidebar
          notes={state.filtered}
          activeId={state.activeNoteId}
          onSelect={actions.setActive}
          onPin={actions.togglePin}
          onDelete={actions.deleteNote}
          loading={state.loading}
          error={state.error}
        />
        <main className="main" role="main" aria-label="Note editor">
          {activeNote ? (
            <NoteEditor
              note={activeNote}
              onChange={actions.updateDraft}
              onSave={() => actions.saveNoteImmediate(activeNote)}
              saving={state.saving}
              error={state.error}
            />
          ) : (
            <EmptyState onCreate={actions.createNote} />
          )}
        </main>
      </div>
      {/* Toast area */}
      <div className={`toast ${state.toast ? 'show' : ''}`} role="status" aria-live="polite">
        {state.toast}
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  /** Root component that provides NotesProvider context and theme attr. */
  return (
    <NotesProvider>
      <AppThemed>
        <AppShell />
      </AppThemed>
    </NotesProvider>
  );
}

function AppThemed({ children }) {
  const { state } = useNotes();
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);
  return children;
}

export default App;
