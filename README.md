# note-organizer-182528-182569

Ocean Notes is a web-based notes application with a React frontend and an Express + SQLite backend.

## Project Structure

- notes_frontend/ — React app (Create React App)
  - src/ — components, state, and API client
  - .env — frontend environment (REACT_APP_API_BASE_URL)
- notes_frontend/note-organizer-182528-182569/backend/ — Express backend
  - src/ — server, routes, models
  - .env — backend environment (PORT, CORS_ORIGIN, DB_PATH)
  - data/notes.db — SQLite database (created on first run)

## Prerequisites

- Node.js >= 18
- npm >= 8

## Environment Configuration

Frontend (notes_frontend/.env):
- REACT_APP_API_BASE_URL=http://localhost:4000/api

Backend (notes_frontend/note-organizer-182528-182569/backend/.env):
- PORT=4000
- CORS_ORIGIN=http://localhost:3000
- DB_PATH=./data/notes.db

These defaults are already created. Adjust if your ports or origins differ.

## Install Dependencies

Open two terminals.

Terminal A (backend):
1) cd note-organizer-182528-182569/notes_frontend/note-organizer-182528-182569/backend
2) npm install

Terminal B (frontend):
1) cd note-organizer-182528-182569/notes_frontend
2) npm install

## Run the Apps (Development)

Backend (Terminal A):
- With auto-reload:
  npm run dev
- Or production mode:
  npm start

The backend will start at http://localhost:4000 and expose:
- Health: GET http://localhost:4000/health -> { "status": "ok" }
- Notes API under /api/notes

Frontend (Terminal B):
- npm start

The frontend will open at http://localhost:3000 and will call the backend at REACT_APP_API_BASE_URL (default http://localhost:4000/api).

## Verify End-to-End Connectivity

1) Health check (optional):
   - Visit http://localhost:4000/health
   - Should return { "status": "ok" }

2) Load the frontend:
   - Visit http://localhost:3000

3) Create a note:
   - Click “+ New Note” in the header OR press Cmd/Ctrl+N.
   - A new “Untitled” note appears in the sidebar.

4) Edit and save:
   - Type a title and content.
   - Saving occurs automatically (debounced) and via the Save button (or Cmd/Ctrl+S).
   - A “Saved” toast should appear. On errors, an error toast appears.

5) List notes:
   - The sidebar should list all notes. The count updates as you add/delete.

6) Pin/unpin:
   - Click the pin icon on a note row; pinned notes should float to the top.

7) Delete:
   - Click the trash icon and confirm. The note disappears from the list.

If any action fails, check:
- Backend console for errors
- Frontend browser console/network tab
- That the .env files are correct (ports, origins)
- That both services are running

## Production Build (Optional)

- Build frontend:
  cd note-organizer-182528-182569/notes_frontend
  npm run build

You can serve the frontend separately with any static host and keep the backend on port 4000. Ensure REACT_APP_API_BASE_URL points to the deployed backend.

## Environment Notes

- Changing frontend REACT_APP_API_BASE_URL requires restarting the dev server.
- CORS_ORIGIN must match the URL you use to access the frontend in the browser.
- The SQLite database file will be created automatically at the path in DB_PATH.

## Scripts

Frontend:
- npm start — start CRA dev server on port 3000
- npm test — run tests
- npm run build — build static assets

Backend:
- npm run dev — start Express with nodemon on port 4000
- npm start — start Express on port 4000
