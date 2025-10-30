import { getDb } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Utility: current time ISO string.
 */
function nowISO() {
  return new Date().toISOString();
}

/**
 * Normalize a database row to API shape:
 * - parse tags JSON text
 * - map snake_case timestamps to camelCase for frontend compatibility if needed
 */
function mapRow(row) {
  if (!row) return null;
  let tags = [];
  try {
    tags = row.tags ? JSON.parse(row.tags) : [];
    if (!Array.isArray(tags)) tags = [];
  } catch {
    tags = [];
  }
  return {
    id: row.id,
    title: row.title || '',
    content: row.content || '',
    tags,
    pinned: !!row.pinned,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at || null,
  };
}

/**
 * Build WHERE filter for list/search with deleted filter (exclude soft-deleted).
 */
function buildListWhere({ query, tag, pinned }) {
  const conds = ['(deleted_at IS NULL)'];
  const params = {};
  if (query) {
    conds.push('(title LIKE @q OR content LIKE @q OR tags LIKE @q)');
    params.q = `%${query}%`;
  }
  if (typeof pinned === 'boolean') {
    conds.push('pinned = @pinned');
    params.pinned = pinned ? 1 : 0;
  }
  if (tag) {
    // tags stored as JSON text array -> search using LIKE on token boundaries, rough match
    // Matches: ["tag"], ["a","tag"], with quotes to reduce false positives.
    conds.push(`tags LIKE @tagLike`);
    params.tagLike = `%"${tag}"%`;
  }
  return { where: conds.length ? `WHERE ${conds.join(' AND ')}` : '', params };
}

// PUBLIC_INTERFACE
export function list({ query = '', tag = '', pinned = undefined } = {}) {
  /**
   * List notes with optional search: full-text-like on title/content and tags (LIKE),
   * optional tag filter, and optional pinned filter. Excludes soft-deleted records.
   * Returns notes sorted: pinned first, then updated_at desc.
   */
  const db = getDb();
  const { where, params } = buildListWhere({ query, tag, pinned });
  const rows = db
    .prepare(
      `
      SELECT id, title, content, tags, pinned, created_at, updated_at, deleted_at
      FROM notes
      ${where}
      ORDER BY pinned DESC, datetime(updated_at) DESC
    `
    )
    .all(params);
  return rows.map(mapRow);
}

// PUBLIC_INTERFACE
export function get(id) {
  /**
   * Get a single note by id. Excludes soft-deleted notes (returns null if deleted).
   */
  const db = getDb();
  const row = db
    .prepare(
      `SELECT id, title, content, tags, pinned, created_at, updated_at, deleted_at
       FROM notes
       WHERE id = ? AND (deleted_at IS NULL)`
    )
    .get(id);
  return mapRow(row);
}

// PUBLIC_INTERFACE
export function create({ title = '', content = '', tags = [], pinned = false } = {}) {
  /**
   * Create a new note with UUID id and timestamps. Tags stored as JSON text. Pinned as 0/1.
   */
  const db = getDb();
  const id = uuidv4();
  const ts = nowISO();
  let tagsJson = '[]';
  try {
    tagsJson = JSON.stringify(Array.isArray(tags) ? tags : []);
  } catch {
    tagsJson = '[]';
  }
  const stmt = db.prepare(
    `INSERT INTO notes (id, title, content, tags, pinned, created_at, updated_at, deleted_at)
     VALUES (@id, @title, @content, @tags, @pinned, @created_at, @updated_at, NULL)`
  );

  stmt.run({
    id,
    title: title ?? '',
    content: content ?? '',
    tags: tagsJson,
    pinned: pinned ? 1 : 0,
    created_at: ts,
    updated_at: ts,
  });

  return get(id);
}

// PUBLIC_INTERFACE
export function update(id, payload = {}) {
  /**
   * Update an existing note. Only provided fields are updated.
   * Automatically updates updated_at timestamp.
   * Returns the updated note (or null if not found).
   */
  const db = getDb();
  const existing = get(id);
  if (!existing) return null;

  const next = {
    title: payload.title !== undefined ? payload.title : existing.title,
    content: payload.content !== undefined ? payload.content : existing.content,
    pinned: payload.pinned !== undefined ? !!payload.pinned : !!existing.pinned,
    tags:
      payload.tags !== undefined
        ? (Array.isArray(payload.tags) ? payload.tags : existing.tags)
        : existing.tags,
  };

  let tagsJson = '[]';
  try {
    tagsJson = JSON.stringify(next.tags || []);
  } catch {
    tagsJson = '[]';
  }

  const ts = nowISO();

  const stmt = db.prepare(
    `UPDATE notes
     SET title = @title,
         content = @content,
         tags = @tags,
         pinned = @pinned,
         updated_at = @updated_at
     WHERE id = @id AND (deleted_at IS NULL)`
  );

  stmt.run({
    id,
    title: next.title ?? '',
    content: next.content ?? '',
    tags: tagsJson,
    pinned: next.pinned ? 1 : 0,
    updated_at: ts,
  });

  return get(id);
}

// PUBLIC_INTERFACE
export function remove(id, { soft = true } = {}) {
  /**
   * Remove a note. If soft=true, sets deleted_at timestamp; otherwise, hard deletes the row.
   * Returns true if a row was affected, false otherwise.
   */
  const db = getDb();
  if (soft) {
    const ts = nowISO();
    const res = db
      .prepare(`UPDATE notes SET deleted_at = @ts, updated_at = @ts WHERE id = @id AND (deleted_at IS NULL)`)
      .run({ id, ts });
    return res.changes > 0;
  }
  const res = db.prepare(`DELETE FROM notes WHERE id = ?`).run(id);
  return res.changes > 0;
}
