import { apiFetch } from './fetch';

export async function sendChatMessage(message, conversationId) {
  return apiFetch('/ai/chat', {
    method: 'POST',
    body: { message, conversationId }
  });
}



export async function clearChat() {
  return apiFetch('/ai/clear', { method: 'POST' });
}

export async function scheduleReminder(data) {
  return apiFetch('/ai/reminder', {
    method: 'POST',
    body: data
  });
}

export async function getReminders() {
  return apiFetch('/ai/reminders', { method: 'GET' });
}

export async function deleteReminder(id) {
  return apiFetch(`/ai/reminder/${id}`, { method: 'DELETE' });
}

export async function updateReminderStatus(id, status) {
  return apiFetch(`/ai/reminder/${id}/status`, {
    method: 'PUT',
    body: { status }
  });
}