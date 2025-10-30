 // PUBLIC_INTERFACE
/**
 * This module re-exports store utilities for compatibility with planned structure.
 * If consumers import notesSlice, they can transition to store hooks transparently.
 */
export { useNotes, NotesProvider } from './store';
