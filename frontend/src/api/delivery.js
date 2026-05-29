import { apiFetch } from './fetch';

export async function getDeliveries(params) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch(`/delivery${query}`, { method: 'GET' });
}
export async function getDelivery(id) {
  return apiFetch(`/delivery/${id}`, { method: 'GET' });
}
export async function createDelivery(data) {
  return apiFetch('/delivery', { method: 'POST', body: data });
}
export async function updateDeliveryStatus(id, data) {
  return apiFetch(`/delivery/${id}/status`, { method: 'PUT', body: data });
}
export async function getAgents(params) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch(`/delivery/agents/list${query}`, { method: 'GET' });
}
export async function createAgent(data) {
  return apiFetch('/delivery/agents', { method: 'POST', body: data });
}
export async function updateAgent(id, data) {
  return apiFetch(`/delivery/agents/${id}`, { method: 'PUT', body: data });
}
export async function getRoutes() {
  return apiFetch('/delivery/routes/list', { method: 'GET' });
}
export async function createRoute(data) {
  return apiFetch('/delivery/routes', { method: 'POST', body: data });
}
