import { apiFetch } from './fetch';

export async function getTasks(projectId, params) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch(`/projects/${projectId}/tasks${query}`, { method: 'GET' });
}

export async function getTask(projectId, id) {
  return apiFetch(`/projects/${projectId}/tasks/${id}`, { method: 'GET' });
}

export async function createTask(projectId, data) {
  return apiFetch(`/projects/${projectId}/tasks`, {
    method: 'POST',
    body: data
  });
}

export async function updateTask(projectId, id, data) {
  return apiFetch(`/projects/${projectId}/tasks/${id}`, {
    method: 'PUT',
    body: data
  });
}

export async function deleteTask(projectId, id) {
  return apiFetch(`/projects/${projectId}/tasks/${id}`, {
    method: 'DELETE'
  });
}

export async function addComment(projectId, taskId, text) {
  return apiFetch(`/projects/${projectId}/tasks/${taskId}/comments`, {
    method: 'POST',
    body: { text }
  });
}

export async function getTaskStats(projectId, params) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch(`/projects/${projectId}/tasks/stats${query}`, { method: 'GET' });
}

export async function addTeamMember(projectId, data) {
  return apiFetch(`/projects/${projectId}/team`, {
    method: 'POST',
    body: data
  });
}

export async function getTeamMembers(projectId) {
  return apiFetch(`/projects/${projectId}/team`, { method: 'GET' });
}

export async function updateTeamMember(projectId, memberId, data) {
  return apiFetch(`/projects/${projectId}/team/${memberId}`, {
    method: 'PUT',
    body: data
  });
}

export async function removeTeamMember(projectId, memberId) {
  return apiFetch(`/projects/${projectId}/team/${memberId}`, {
    method: 'DELETE'
  });
}