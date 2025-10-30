const BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

async function http(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const msg = await safeText(res);
    throw new Error(msg || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

async function safeText(res) {
  try { return await res.text(); } catch { return ''; }
}

// PUBLIC_INTERFACE
export async function getNotes(q = '') {
  const qs = q ? `?q=${encodeURIComponent(q)}` : '';
  return http(`/notes${qs}`, { method: 'GET' });
}

// PUBLIC_INTERFACE
export async function getNote(id) {
  return http(`/notes/${encodeURIComponent(id)}`, { method: 'GET' });
}

// PUBLIC_INTERFACE
export async function createNote(payload) {
  return http(`/notes`, { method: 'POST', body: JSON.stringify(payload || {}) });
}

// PUBLIC_INTERFACE
export async function updateNote(id, payload) {
  return http(`/notes/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(payload || {}) });
}

// PUBLIC_INTERFACE
export async function deleteNote(id) {
  return http(`/notes/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
