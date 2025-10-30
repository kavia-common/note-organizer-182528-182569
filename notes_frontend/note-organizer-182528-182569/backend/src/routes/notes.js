import express from 'express';
import * as Note from '../models/note.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { validateCreateNote, validateUpdateNote, validateListQuery } from '../validators/notes.js';

const router = express.Router();

/**
 * Map model note to API response shape ensuring only expected fields.
 * The model already returns id, title, content, tags, pinned, createdAt, updatedAt, deletedAt (nullable),
 * but we omit deletedAt from public responses (unless needed later).
 */
function toPublic(note) {
  if (!note) return null;
  return {
    id: note.id,
    title: note.title || '',
    content: note.content || '',
    tags: Array.isArray(note.tags) ? note.tags : [],
    pinned: !!note.pinned,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
}

/**
 * GET /api/notes
 * Optional filters: q (search), tag, pinned=true|false
 */
router.get(
  '/',
  validateQuery(validateListQuery),
  (req, res, next) => {
    try {
      const { q, tag, pinned } = req.query;
      const items = Note.list({
        query: q || '',
        tag: tag || '',
        pinned: pinned === undefined ? undefined : !!pinned,
      });
      return res.json(items.map(toPublic));
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * GET /api/notes/:id
 */
router.get('/:id', (req, res, next) => {
  try {
    const item = Note.get(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'not_found', message: 'Note not found' });
    }
    return res.json(toPublic(item));
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /api/notes
 */
router.post(
  '/',
  validateBody(validateCreateNote),
  (req, res, next) => {
    try {
      const created = Note.create(req.body || {});
      return res.status(201).json(toPublic(created));
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * PUT /api/notes/:id
 */
router.put(
  '/:id',
  validateBody(validateUpdateNote),
  (req, res, next) => {
    try {
      const updated = Note.update(req.params.id, req.body || {});
      if (!updated) {
        return res.status(404).json({ error: 'not_found', message: 'Note not found' });
      }
      return res.json(toPublic(updated));
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * DELETE /api/notes/:id
 * Soft delete by default; model handles soft delete.
 */
router.delete('/:id', (req, res, next) => {
  try {
    const ok = Note.remove(req.params.id, { soft: true });
    if (!ok) {
      return res.status(404).json({ error: 'not_found', message: 'Note not found' });
    }
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

export default router;
