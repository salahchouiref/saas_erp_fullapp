import { apiFetch } from './fetch';

export async function getCatalog(params) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch(`/services/catalog${query}`, { method: 'GET' });
}
export async function createCatalogItem(data) {
  return apiFetch('/services/catalog', { method: 'POST', body: data });
}
export async function getServiceRequests(params) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch(`/services/requests${query}`, { method: 'GET' });
}
export async function createServiceRequest(data) {
  return apiFetch('/services/requests', { method: 'POST', body: data });
}
export async function updateServiceRequestStatus(id, data) {
  return apiFetch(`/services/requests/${id}/status`, { method: 'PUT', body: data });
}
export async function getRequestHistory(id) {
  return apiFetch(`/services/requests/${id}/history`, { method: 'GET' });
}
export async function getTechnicians(params) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch(`/services/technicians${query}`, { method: 'GET' });
}
export async function createTechnician(data) {
  return apiFetch('/services/technicians', { method: 'POST', body: data });
}
export async function getServiceReports() {
  return apiFetch('/services/reports', { method: 'GET' });
}
export async function createServiceReport(data) {
  return apiFetch('/services/reports', { method: 'POST', body: data });
}
