import { apiFetch } from './fetch';

export async function login(email, password) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: { email, password }
  });
}

export async function getSession() {
  return apiFetch('/auth/me', {
    method: 'GET'
  });
}

export async function logout() {
  return apiFetch('/auth/logout', {
    method: 'POST'
  });
}
