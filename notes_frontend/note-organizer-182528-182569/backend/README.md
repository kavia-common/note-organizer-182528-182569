# Ocean Notes Backend (Express + SQLite)

This is the backend service for Ocean Notes. It provides a REST API (to be implemented) backed by SQLite using better-sqlite3.

## Tech Stack

- Node.js + Express
- better-sqlite3 (synchronous, fast SQLite driver)
- CORS, dotenv, morgan
- nodemon for development

## Getting Started

1) Install dependencies

   npm install

2) Configure environment (optional)

   - Copy .env.example to .env and adjust as needed.
   - Variables:
     - PORT (default 4000)
     - CORS_ORIGIN (default http://localhost:3000)
     - DB_PATH (default ./data/notes.db relative to backend root)

3) Run in development

   npm run dev

4) Run in production

   npm start

The server exposes a simple health check at:

GET /health  ->  { "status": "ok" }

## Database

- DB file path is controlled by DB_PATH. Default is ./data/notes.db under the backend folder.
- On first run, the necessary tables and indices are created automatically.

## Project Structure

- src/index.js: Express app bootstrap
- src/db.js: SQLite singleton and schema initialization
- .env.example: Environment variables reference

Routes and business logic will be implemented in later steps.
