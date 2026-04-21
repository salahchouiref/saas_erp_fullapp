import { apiFetch } from './fetch';

export async function sendChatMessage(message) {
  return apiFetch('/ai/chat', {
    method: 'POST',
    body: { message }
  });
}

export async function sendAutomation(command) {
  return apiFetch('/ai/automate', {
    method: 'POST',
    body: { command }
  });
}