import { apiFetch } from './fetch';

export async function getEmployees(params) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch(`/employees${query}`, { method: 'GET' });
}

export async function getEmployee(id) {
  return apiFetch(`/employees/${id}`, { method: 'GET' });
}

export async function createEmployee(data) {
  return apiFetch('/employees', {
    method: 'POST',
    body: data
  });
}

export async function updateEmployee(id, data) {
  return apiFetch(`/employees/${id}`, {
    method: 'PUT',
    body: data
  });
}

export async function deleteEmployee(id) {
  return apiFetch(`/employees/${id}`, {
    method: 'DELETE'
  });
}
