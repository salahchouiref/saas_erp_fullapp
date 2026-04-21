import { apiFetch } from './fetch';

export async function getTasks(params) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch(`/tasks${query}`, { method: 'GET' });
}

export async function getTask(id) {
  return apiFetch(`/tasks/${id}`, { method: 'GET' });
}

export async function createTask(data) {
  return apiFetch('/tasks', {
    method: 'POST',
    body: data
  });
}

export async function updateTask(id, data) {
  return apiFetch(`/tasks/${id}`, {
    method: 'PUT',
    body: data
  });
}

export async function deleteTask(id) {
  return apiFetch(`/tasks/${id}`, {
    method: 'DELETE'
  });
}

export async function addComment(taskId, text) {
  return apiFetch(`/tasks/${taskId}/comments`, {
    method: 'POST',
    body: { text }
  });
}

export async function getTaskStats(params) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch(`/tasks/stats${query}`, { method: 'GET' });
}

export async function addTeamMember(data) {
  return apiFetch('/tasks/team', {
    method: 'POST',
    body: data
  });
}

export async function getTeamMembers(projectId) {
  const query = projectId ? `?projectId=${projectId}` : '';
  return apiFetch(`/tasks/team${query}`, { method: 'GET' });
}

export async function updateTeamMember(id, data) {
  return apiFetch(`/tasks/team/${id}`, {
    method: 'PUT',
    body: data
  });
}

export async function removeTeamMember(id) {
  return apiFetch(`/tasks/team/${id}`, {
    method: 'DELETE'
  });
}