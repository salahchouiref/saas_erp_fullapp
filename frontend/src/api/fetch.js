// Central fetch utility for API requests
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export async function apiFetch(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const opts = {
    credentials: 'include', // send cookies for auth
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  };
  if (opts.body && typeof opts.body !== 'string') {
    opts.body = JSON.stringify(opts.body);
  }
  const res = await fetch(url, opts);
  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }
  if (!res.ok) {
    throw { status: res.status, data };
  }
  return data;
}

export { API_BASE_URL };