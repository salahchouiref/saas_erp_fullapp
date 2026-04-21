import { apiFetch } from './fetch';

export async function getWorkflows() {
  return apiFetch('/workflows', { method: 'GET' });
}

export async function getWorkflow(id) {
  return apiFetch(`/workflows/${id}`, { method: 'GET' });
}

export async function createWorkflow(data) {
  return apiFetch('/workflows', {
    method: 'POST',
    body: data
  });
}

export async function updateWorkflow(id, data) {
  return apiFetch(`/workflows/${id}`, {
    method: 'PUT',
    body: data
  });
}

export async function deleteWorkflow(id) {
  return apiFetch(`/workflows/${id}`, { method: 'DELETE' });
}

export async function runWorkflow(id, inputs = {}) {
  return apiFetch(`/workflows/${id}/run`, {
    method: 'POST',
    body: { inputs }
  });
}

export async function getAvailableActions() {
  return apiFetch('/workflows/actions', { method: 'GET' });
}

export async function getNotifications() {
  return apiFetch('/notifications', { method: 'GET' });
}

export async function markNotificationRead(id) {
  return apiFetch(`/notifications/${id}/read`, { method: 'PUT' });
}

export async function markAllNotificationsRead() {
  return apiFetch('/notifications/read-all', { method: 'PUT' });
}

export async function deleteNotification(id) {
  return apiFetch(`/notifications/${id}`, { method: 'DELETE' });
}