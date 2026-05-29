import { apiFetch } from './fetch';

export async function getEmployees(params) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch(`/hr${query}`, { method: 'GET' });
}

export async function getEmployee(id) {
  return apiFetch(`/hr/${id}`, { method: 'GET' });
}

export async function createEmployee(data) {
  return apiFetch('/hr', {
    method: 'POST',
    body: data
  });
}

export async function updateEmployee(id, data) {
  return apiFetch(`/hr/${id}`, {
    method: 'PUT',
    body: data
  });
}

export async function deleteEmployee(id) {
  return apiFetch(`/hr/${id}`, {
    method: 'DELETE'
  });
}

export async function getEmployeeStats() {
  return apiFetch('/hr/stats/overview', { method: 'GET' });
}
