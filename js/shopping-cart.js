// js/shopping-cart.js
// Lógica de shopping-cart.html:
// - Carga el carrito desde sessionStorage
// - Permite editar cantidades con confirmación / cancelación
// - Permite eliminar productos
// - Calcula y muestra el total

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  renderCart();
});

// ── Renderizado del carrito ───────────────────────────────────────────────────

function renderCart() {
  const cart = getCart();
  const container = document.getElementById('cartItems');
  const summaryContainer = document.getElementById('cartSummary');

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="text-center py-5">
        <i class="fa fa-shopping-cart fa-4x text-muted mb-3"></i>
        <h5 class="text-muted">Tu carrito está vacío</h5>
        <a href="index.html" class="btn btn-primary mt-3">
          <i class="fa fa-arrow-left me-1"></i>Ver productos
        </a>
      </div>`;
    summaryContainer.innerHTML = '';
    return;
  }

  // Items
  container.innerHTML = cart.map(item => `
    <div class="card mb-3 shadow-sm" id="item-${item.id}">
      <div class="card-body">
        <div class="d-flex align-items-center gap-3 flex-wrap">

          <!-- Imagen -->
          <div class="flex-shrink-0">
            <img src="${item.imageUrl}" alt="${item.title}"
              class="rounded" style="width:110px; height:110px; object-fit:cover;"
              onerror="this.src='https://via.placeholder.com/110?text=Sin+img'">
          </div>

          <!-- Info -->
          <div class="flex-grow-1">
            <h5 class="mb-1">${item.title}</h5>
            <p class="text-muted small mb-1">${item.description}</p>
            <p class="fw-bold text-primary mb-2">
              $${item.pricePerUnit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              <span class="text-muted fw-normal small">/ ${item.unit}</span>
            </p>

            <!-- Control de cantidad (modo vista) -->
            <div class="d-flex align-items-center gap-2" id="view-${item.id}">
              <span class="text-muted small">Cantidad:</span>
              <span class="badge bg-secondary fs-6 px-3">${item.quantity}</span>
              <button class="btn btn-outline-primary btn-sm ms-2"
                onclick="startEdit('${item.id}', ${item.quantity})">
                <i class="fa fa-pencil me-1"></i>Editar
              </button>
            </div>

            <!-- Control de cantidad (modo edición) - oculto por defecto -->
            <div class="d-flex align-items-center gap-2 d-none" id="edit-${item.id}">
              <span class="text-muted small">Cantidad:</span>
              <button class="btn btn-outline-secondary btn-sm"
                onclick="changeEditQty('${item.id}', -1)">
                <i class="fa fa-minus"></i>
              </button>
              <input type="number" id="qty-input-${item.id}"
                class="form-control text-center" value="${item.quantity}" min="1"
                style="width:65px;">
              <button class="btn btn-outline-secondary btn-sm"
                onclick="changeEditQty('${item.id}', 1)">
                <i class="fa fa-plus"></i>
              </button>
              <button class="btn btn-success btn-sm ms-1"
                onclick="confirmEdit('${item.id}')">
                <i class="fa fa-check"></i>
              </button>
              <button class="btn btn-outline-secondary btn-sm"
                onclick="cancelEdit('${item.id}', ${item.quantity})">
                <i class="fa fa-times"></i>
              </button>
            </div>
          </div>

          <!-- Total item + eliminar -->
          <div class="text-end">
            <p class="fw-bold text-primary fs-5 mb-2" id="subtotal-${item.id}">
              $${(item.pricePerUnit * item.quantity).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
            <button class="btn btn-outline-danger btn-sm"
              onclick="confirmRemove('${item.id}', '${item.title.replace(/'/g, "\\'")}')">
              <i class="fa fa-trash me-1"></i>Eliminar
            </button>
          </div>

        </div>
      </div>
    </div>
  `).join('');

  // Resumen / total
  renderSummary(cart);
}

function renderSummary(cart) {
  const total = getTotal();
  const summaryContainer = document.getElementById('cartSummary');

  summaryContainer.innerHTML = `
    <div class="card border-primary shadow-sm">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0"><i class="fa fa-receipt me-2"></i>Resumen de compra</h5>
      </div>
      <div class="card-body">
        ${cart.map(item => `
          <div class="d-flex justify-content-between mb-1">
            <span class="text-muted small">${item.title} × ${item.quantity}</span>
            <span class="small fw-bold">
              $${(item.pricePerUnit * item.quantity).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
          </div>
        `).join('')}
        <hr>
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Total:</h5>
          <h5 class="text-primary mb-0 fw-bold" id="totalDisplay">
            $${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
          </h5>
        </div>
      </div>
      <div class="card-footer bg-white d-flex gap-2 justify-content-end">
        <a href="index.html" class="btn btn-outline-secondary">
          <i class="fa fa-arrow-left me-1"></i>Cancelar
        </a>
        <button class="btn btn-success" onclick="checkout()">
          <i class="fa fa-credit-card me-1"></i>Pagar
        </button>
      </div>
    </div>`;
}

// ── Edición de cantidad ───────────────────────────────────────────────────────

function startEdit(id, currentQty) {
  document.getElementById(`view-${id}`).classList.add('d-none');
  document.getElementById(`edit-${id}`).classList.remove('d-none');
  document.getElementById(`qty-input-${id}`).value = currentQty;
}

function changeEditQty(id, delta) {
  const input = document.getElementById(`qty-input-${id}`);
  const newVal = Math.max(1, parseInt(input.value) + delta);
  input.value = newVal;
}

function confirmEdit(id) {
  const input = document.getElementById(`qty-input-${id}`);
  const newQty = parseInt(input.value);

  if (isNaN(newQty) || newQty < 1) return;

  updateQuantity(id, newQty);
  renderCart(); // re-renderizar para reflejar el cambio
}

function cancelEdit(id, originalQty) {
  document.getElementById(`qty-input-${id}`).value = originalQty;
  document.getElementById(`edit-${id}`).classList.add('d-none');
  document.getElementById(`view-${id}`).classList.remove('d-none');
}

// ── Eliminar producto ─────────────────────────────────────────────────────────

function confirmRemove(id, title) {
  // Guardar para usar en el modal
  document.getElementById('removeProductName').textContent = `"${title}"`;
  document.getElementById('confirmRemoveBtn').onclick = () => {
    removeFromCart(id);
    bootstrap.Modal.getInstance(document.getElementById('removeModal')).hide();
    renderCart();
  };

  new bootstrap.Modal(document.getElementById('removeModal')).show();
}

// ── Checkout ──────────────────────────────────────────────────────────────────

function checkout() {
  clearCart();
  renderCart();
  const modal = new bootstrap.Modal(document.getElementById('checkoutModal'));
  modal.show();
}
