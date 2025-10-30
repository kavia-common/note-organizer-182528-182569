//
// Validators for notes routes
//

function isString(x) {
  return typeof x === 'string';
}
function isBoolean(x) {
  return typeof x === 'boolean';
}
function isStringArray(x) {
  if (!Array.isArray(x)) return false;
  return x.every(isString);
}

/**
 * PUBLIC_INTERFACE
 * validateCreateNote validates payload for creating a note.
 * Allowed fields: title (string), content (string), tags (string[]), pinned (boolean)
 */
export function validateCreateNote(body) {
  const errors = [];
  const value = {
    title: '',
    content: '',
    tags: [],
    pinned: false,
  };

  if (body.title !== undefined) {
    if (!isString(body.title)) errors.push('title must be a string');
    else value.title = body.title;
  }

  if (body.content !== undefined) {
    if (!isString(body.content)) errors.push('content must be a string');
    else value.content = body.content;
  }

  if (body.tags !== undefined) {
    if (!isStringArray(body.tags)) errors.push('tags must be an array of strings');
    else value.tags = body.tags;
  }

  if (body.pinned !== undefined) {
    if (!isBoolean(body.pinned)) errors.push('pinned must be a boolean');
    else value.pinned = body.pinned;
  }

  return { valid: errors.length === 0, errors, value };
}

/**
 * PUBLIC_INTERFACE
 * validateUpdateNote validates partial update payload for a note.
 * Any subset of fields is allowed.
 */
export function validateUpdateNote(body) {
  const errors = [];
  const value = {};
  if (body.title !== undefined) {
    if (!isString(body.title)) errors.push('title must be a string');
    else value.title = body.title;
  }
  if (body.content !== undefined) {
    if (!isString(body.content)) errors.push('content must be a string');
    else value.content = body.content;
  }
  if (body.tags !== undefined) {
    if (!isStringArray(body.tags)) errors.push('tags must be an array of strings');
    else value.tags = body.tags;
  }
  if (body.pinned !== undefined) {
    if (!isBoolean(body.pinned)) errors.push('pinned must be a boolean');
    else value.pinned = body.pinned;
  }
  return { valid: errors.length === 0, errors, value };
}

/**
 * PUBLIC_INTERFACE
 * validateListQuery validates optional query params for list endpoint.
 * Supports: q (string), tag (string), pinned (boolean: 'true'/'false')
 */
export function validateListQuery(query) {
  const errors = [];
  const value = {};
  if (query.q !== undefined) {
    if (!isString(query.q)) errors.push('q must be a string');
    else value.q = query.q;
  }
  if (query.tag !== undefined) {
    if (!isString(query.tag)) errors.push('tag must be a string');
    else value.tag = query.tag;
  }
  if (query.pinned !== undefined) {
    const str = String(query.pinned).toLowerCase();
    if (str !== 'true' && str !== 'false') errors.push('pinned must be true or false');
    else value.pinned = str === 'true';
  }
  return { valid: errors.length === 0, errors, value };
}
