// js/api.js
// Módulo de comunicación con el backend (Práctica 3 - localhost:3100)
// Todas las peticiones van aquí; el resto del código solo llama estas funciones.

const API_URL = 'http://localhost:3100/api';

// ── Productos ─────────────────────────────────────────────────────────────────

/**
 * Obtiene todos los productos del servidor.
 * Retorna el arreglo completo (la paginación se hace en el front).
 */
async function fetchProducts(filters = {}) {
  const params = new URLSearchParams(filters);
  const url = `${API_URL}/products${params.toString() ? '?' + params : ''}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error al obtener productos: ${res.status}`);

  const data = await res.json();
  return data.data; // arreglo de productos
}

/**
 * Obtiene un producto por ID.
 */
async function fetchProductById(id) {
  const res = await fetch(`${API_URL}/products/${id}`);
  if (!res.ok) throw new Error(`Producto no encontrado: ${res.status}`);
  const data = await res.json();
  return data.data;
}

/**
 * Crea un nuevo producto (requiere rol admin).
 */
async function createProduct(productData) {
  const res = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-auth': 'admin' },
    body: JSON.stringify(productData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al crear producto');
  return data.data;
}

/**
 * Actualiza un producto existente (requiere rol admin).
 */
async function updateProduct(id, productData) {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-auth': 'admin' },
    body: JSON.stringify(productData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al actualizar producto');
  return data.data;
}

/**
 * Elimina un producto (requiere rol admin).
 */
async function deleteProduct(id) {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: 'DELETE',
    headers: { 'x-auth': 'admin' }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al eliminar producto');
  return data;
}
