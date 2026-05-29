import { apiFetch } from './fetch';

export async function getProducts(params) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch(`/stock/products${query}`, { method: 'GET' });
}
export async function getProduct(id) {
  return apiFetch(`/stock/products/${id}`, { method: 'GET' });
}
export async function createProduct(data) {
  return apiFetch('/stock/products', { method: 'POST', body: data });
}
export async function updateProduct(id, data) {
  return apiFetch(`/stock/products/${id}`, { method: 'PUT', body: data });
}
export async function deleteProduct(id) {
  return apiFetch(`/stock/products/${id}`, { method: 'DELETE' });
}
export async function getCategories() {
  return apiFetch('/stock/categories', { method: 'GET' });
}
export async function createCategory(data) {
  return apiFetch('/stock/categories', { method: 'POST', body: data });
}
export async function getWarehouses() {
  return apiFetch('/stock/warehouses', { method: 'GET' });
}
export async function createWarehouse(data) {
  return apiFetch('/stock/warehouses', { method: 'POST', body: data });
}
export async function getStockMovements(params) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch(`/stock/movements${query}`, { method: 'GET' });
}
export async function createStockMovement(data) {
  return apiFetch('/stock/movements', { method: 'POST', body: data });
}
export async function getStockLevels(params) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch(`/stock/levels${query}`, { method: 'GET' });
}
export async function getSuppliers() {
  return apiFetch('/stock/suppliers', { method: 'GET' });
}
export async function createSupplier(data) {
  return apiFetch('/stock/suppliers', { method: 'POST', body: data });
}
export async function updateSupplier(id, data) {
  return apiFetch(`/stock/suppliers/${id}`, { method: 'PUT', body: data });
}
