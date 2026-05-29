import { apiFetch } from './fetch';

export async function getOrders(params) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch(`/orders/orders${query}`, { method: 'GET' });
}
export async function getOrder(id) {
  return apiFetch(`/orders/orders/${id}`, { method: 'GET' });
}
export async function createOrder(data) {
  return apiFetch('/orders/orders', { method: 'POST', body: data });
}
export async function updateOrder(id, data) {
  return apiFetch(`/orders/orders/${id}`, { method: 'PUT', body: data });
}
export async function deleteOrder(id) {
  return apiFetch(`/orders/orders/${id}`, { method: 'DELETE' });
}
export async function addPayment(orderId, data) {
  return apiFetch(`/orders/orders/${orderId}/payments`, { method: 'POST', body: data });
}
export async function getInvoices() {
  return apiFetch('/orders/invoices', { method: 'GET' });
}
export async function getOrderStats() {
  return apiFetch('/orders/orders/stats', { method: 'GET' });
}
