import { apiFetch } from './fetch';

export async function getProjects(params) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch(`/projects${query}`, { method: 'GET' });
}

export async function getProject(id) {
  return apiFetch(`/projects/${id}`, { method: 'GET' });
}

export async function createProject(data) {
  return apiFetch('/projects', {
    method: 'POST',
    body: data
  });
}

export async function updateProject(id, data) {
  return apiFetch(`/projects/${id}`, {
    method: 'PUT',
    body: data
  });
}

export async function deleteProject(id) {
  return apiFetch(`/projects/${id}`, {
    method: 'DELETE'
  });
}
