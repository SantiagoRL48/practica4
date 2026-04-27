// js/cart.js
// Módulo de gestión del carrito de compras.

const CART_KEY = 'cart';

// ── Leer / Escribir ───────────────────────────────────────────────────────────

function getCart() {
  return JSON.parse(sessionStorage.getItem(CART_KEY) || '[]');
}

function saveCart(cart) {
  sessionStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// ── Operaciones ───────────────────────────────────────────────────────────────

/**
 * Agrega un producto al carrito o incrementa su cantidad si ya existe.
 * @param {Object} product - Objeto producto del servidor.
 * @param {number} quantity - Cantidad a agregar (default 1).
 */
function addToCart(product, quantity = 1) {
  const cart = getCart();
  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      description: product.description,
      imageUrl: product.imageUrl,
      pricePerUnit: product.pricePerUnit,
      unit: product.unit,
      quantity
    });
  }

  saveCart(cart);
  updateCartBadge();
}

/**
 * Actualiza la cantidad de un item por su id.
 * Si quantity <= 0, elimina el item.
 */
function updateQuantity(id, quantity) {
  let cart = getCart();

  if (quantity <= 0) {
    cart = cart.filter(item => item.id !== id);
  } else {
    const item = cart.find(item => item.id === id);
    if (item) item.quantity = quantity;
  }

  saveCart(cart);
  updateCartBadge();
}

/**
 * Elimina un producto del carrito por su id.
 */
function removeFromCart(id) {
  const cart = getCart().filter(item => item.id !== id);
  saveCart(cart);
  updateCartBadge();
}

/**
 * Vacía el carrito completamente.
 */
function clearCart() {
  sessionStorage.removeItem(CART_KEY);
  updateCartBadge();
}

/**
 * Calcula el total del carrito.
 */
function getTotal() {
  return getCart().reduce((sum, item) => sum + item.pricePerUnit * item.quantity, 0);
}

/**
 * Actualiza el badge del ícono del carrito en el navbar.
 */
function updateCartBadge() {
  const total = getCart().reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('.cart-badge').forEach(el => {
    el.textContent = total;
  });
}
