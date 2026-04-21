import { apiFetch } from './fetch';

export async function getClients(params) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch(`/clients${query}`, { method: 'GET' });
}

export async function getClient(id) {
  return apiFetch(`/clients/${id}`, { method: 'GET' });
}

export async function createClient(data) {
  return apiFetch('/clients', {
    method: 'POST',
    body: data
  });
}

export async function updateClient(id, data) {
  return apiFetch(`/clients/${id}`, {
    method: 'PUT',
    body: data
  });
}

export async function deleteClient(id) {
  return apiFetch(`/clients/${id}`, {
    method: 'DELETE'
  });
}
