# Ocean Notes Frontend Additions

- Ocean Professional theme (primary #2563EB, secondary/success #F59E0B, error #EF4444, background #f9fafb, surface #ffffff, text #111827).
- Components: Header, Sidebar, NoteEditor, EmptyState.
- State management: Context + reducer with notes[], activeNoteId, query, loading/error, saving, toast.
- API client uses REACT_APP_API_BASE_URL (defaults to '/api').
- Debounced search (300ms) and autosave (700ms); optimistic create/pin/delete.
- Keyboard shortcuts:
  - Cmd/Ctrl+N: New note
  - Cmd/Ctrl+S: Save note
- Accessibility: roles, labels, focus outlines, aria-live for saving/toasts.

Environment:
- Copy `.env.example` to `.env` and set REACT_APP_API_BASE_URL to your backend if not using '/api'.
