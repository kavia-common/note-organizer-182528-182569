import React, { createContext, useContext, useMemo, useReducer, useCallback, useEffect, useRef } from 'react';
import * as api from '../api/client';

// --- Types ---
// Note shape expected from API: { id, title, content, tags[], pinned, createdAt, updatedAt }

// Utils
function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

function nowISO() {
  return new Date().toISOString();
}

// State
const initialState = {
  theme: 'light',
  notes: [],
  filtered: [],
  activeNoteId: null,
  query: '',
  loading: false,
  error: null,
  saving: false,
  toast: '',
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.theme };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    case 'SET_NOTES': {
      const sorted = sortNotes(action.notes);
      return { ...state, notes: sorted, filtered: filterNotes(sorted, state.query) };
    }
    case 'SET_ACTIVE':
      return { ...state, activeNoteId: action.id || null };
    case 'SET_QUERY': {
      const filtered = filterNotes(state.notes, action.query);
      return { ...state, query: action.query, filtered };
    }
    case 'UPSERT_NOTE': {
      const existingIdx = state.notes.findIndex(n => n.id === action.note.id);
      let updated = [...state.notes];
      if (existingIdx >= 0) updated[existingIdx] = action.note;
      else updated = [action.note, ...updated];
      updated = sortNotes(updated);
      return { ...state, notes: updated, filtered: filterNotes(updated, state.query) };
    }
    case 'DELETE_NOTE': {
      const updated = state.notes.filter(n => n.id !== action.id);
      const filtered = filterNotes(updated, state.query);
      const nextActive = state.activeNoteId === action.id ? (filtered[0]?.id || null) : state.activeNoteId;
      return { ...state, notes: updated, filtered, activeNoteId: nextActive };
    }
    case 'SET_SAVING':
      return { ...state, saving: action.saving };
    case 'SET_TOAST':
      return { ...state, toast: action.message };
    default:
      return state;
  }
}

function sortNotes(list) {
  return [...list].sort((a, b) => {
    if ((a.pinned ? 1 : 0) !== (b.pinned ? 1 : 0)) return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
    const at = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const bt = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return bt - at;
  });
}

function filterNotes(list, q) {
  if (!q) return list;
  const qq = q.toLowerCase();
  return list.filter(n =>
    (n.title || '').toLowerCase().includes(qq) ||
    (n.content || '').toLowerCase().includes(qq) ||
    (n.tags || []).some(t => (t || '').toLowerCase().includes(qq))
  );
}

const NotesContext = createContext(null);

// PUBLIC_INTERFACE
export function NotesProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const toastTimer = useRef(null);

  const setToast = useCallback((message) => {
    dispatch({ type: 'SET_TOAST', message });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => dispatch({ type: 'SET_TOAST', message: '' }), 1800);
  }, []);

  // Debounced helpers
  const debouncedSearch = useMemo(() => debounce((q) => {
    dispatch({ type: 'SET_QUERY', query: q });
  }, 300), []);

  const debouncedSave = useMemo(() => debounce(async (note) => {
    try {
      dispatch({ type: 'SET_SAVING', saving: true });
      const saved = await api.updateNote(note.id, note);
      dispatch({ type: 'UPSERT_NOTE', note: saved });
      dispatch({ type: 'SET_SAVING', saving: false });
      setToast('Saved');
    } catch (e) {
      dispatch({ type: 'SET_SAVING', saving: false });
      dispatch({ type: 'SET_ERROR', error: e.message || String(e) });
      setToast('Save failed');
    }
  }, 700), [setToast]);

  // Actions
  const actions = useMemo(() => ({
    // PUBLIC_INTERFACE
    toggleTheme: () => dispatch({ type: 'SET_THEME', theme: state.theme === 'light' ? 'dark' : 'light' }),

    // PUBLIC_INTERFACE
    async fetchNotes() {
      dispatch({ type: 'SET_LOADING', loading: true });
      try {
        const items = await api.getNotes();
        dispatch({ type: 'SET_NOTES', notes: items || [] });
        if (!state.activeNoteId && (items || []).length) {
          dispatch({ type: 'SET_ACTIVE', id: items[0].id });
        }
      } catch (e) {
        dispatch({ type: 'SET_ERROR', error: e.message || String(e) });
      } finally {
        dispatch({ type: 'SET_LOADING', loading: false });
      }
    },

    // PUBLIC_INTERFACE
    setActive(id) {
      dispatch({ type: 'SET_ACTIVE', id });
    },

    // PUBLIC_INTERFACE
    setQuery(q) {
      debouncedSearch(q);
    },

    // PUBLIC_INTERFACE
    async createNote() {
      // Optimistic: create a temp note
      const tempId = `temp-${Math.random().toString(36).slice(2)}`;
      const temp = {
        id: tempId,
        title: 'Untitled',
        content: '',
        tags: [],
        pinned: false,
        createdAt: nowISO(),
        updatedAt: nowISO(),
      };
      dispatch({ type: 'UPSERT_NOTE', note: temp });
      dispatch({ type: 'SET_ACTIVE', id: tempId });

      try {
        const created = await api.createNote({ title: temp.title, content: temp.content, tags: temp.tags, pinned: false });
        dispatch({ type: 'DELETE_NOTE', id: tempId });
        dispatch({ type: 'UPSERT_NOTE', note: created });
        dispatch({ type: 'SET_ACTIVE', id: created.id });
        setToast('Note created');
      } catch (e) {
        dispatch({ type: 'DELETE_NOTE', id: tempId });
        dispatch({ type: 'SET_ERROR', error: e.message || String(e) });
        setToast('Create failed');
      }
    },

    // PUBLIC_INTERFACE
    updateDraft(note) {
      // Immediate local update, schedule save
      const local = { ...note, updatedAt: nowISO() };
      dispatch({ type: 'UPSERT_NOTE', note: local });
      if (!String(note.id || '').startsWith('temp-')) {
        debouncedSave(local);
      }
    },

    // PUBLIC_INTERFACE
    async saveNoteImmediate(note) {
      try {
        dispatch({ type: 'SET_SAVING', saving: true });
        const saved = await api.updateNote(note.id, note);
        dispatch({ type: 'UPSERT_NOTE', note: saved });
        dispatch({ type: 'SET_SAVING', saving: false });
        setToast('Saved');
      } catch (e) {
        dispatch({ type: 'SET_SAVING', saving: false });
        dispatch({ type: 'SET_ERROR', error: e.message || String(e) });
        setToast('Save failed');
      }
    },

    // PUBLIC_INTERFACE
    async deleteNote(id) {
      const backup = state.notes.find(n => n.id === id);
      dispatch({ type: 'DELETE_NOTE', id });
      try {
        await api.deleteNote(id);
        setToast('Deleted');
      } catch (e) {
        // revert
        if (backup) dispatch({ type: 'UPSERT_NOTE', note: backup });
        dispatch({ type: 'SET_ERROR', error: e.message || String(e) });
        setToast('Delete failed');
      }
    },

    // PUBLIC_INTERFACE
    async togglePin(id) {
      const note = state.notes.find(n => n.id === id);
      if (!note) return;
      const updated = { ...note, pinned: !note.pinned, updatedAt: nowISO() };
      dispatch({ type: 'UPSERT_NOTE', note: updated });
      try {
        const saved = await api.updateNote(id, { pinned: updated.pinned });
        dispatch({ type: 'UPSERT_NOTE', note: { ...note, ...saved } });
        setToast(updated.pinned ? 'Pinned' : 'Unpinned');
      } catch (e) {
        // revert on error
        dispatch({ type: 'UPSERT_NOTE', note });
        dispatch({ type: 'SET_ERROR', error: e.message || String(e) });
        setToast('Pin failed');
      }
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [state.theme, state.notes, state.activeNoteId, debouncedSearch, debouncedSave, setToast]);

  // Keep filtered in sync if notes change externally and query exists
  useEffect(() => {
    if (state.query) {
      dispatch({ type: 'SET_QUERY', query: state.query });
    }
  }, [state.notes]); // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo(() => ({ state, actions }), [state, actions]);
  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

// PUBLIC_INTERFACE
export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error('useNotes must be used within NotesProvider');
  return ctx;
}
