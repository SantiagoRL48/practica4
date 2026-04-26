// js/home.js
// Lógica de index.html:
// - Carga productos desde el servidor
// - Paginación de 4 por página (cliente)
// - Modal de confirmación para agregar al carrito
// - Filtros por título y categoría

const PRODUCTS_PER_PAGE = 4;

let allProducts = [];   // todos los productos del servidor
let filtered = [];      // productos después de aplicar filtros
let currentPage = 1;
let selectedProduct = null; // producto seleccionado para agregar al carrito

// ── Inicialización ────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  updateCartBadge();
  await loadProducts();
  setupSearch();
});

// ── Carga de productos ────────────────────────────────────────────────────────

async function loadProducts() {
  const container = document.getElementById('productList');
  container.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2 text-muted">Cargando productos...</p>
    </div>`;

  try {
    allProducts = await fetchProducts();
    filtered = [...allProducts];
    currentPage = 1;
    renderPage();
  } catch (err) {
    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger">
          <i class="fa fa-exclamation-triangle me-2"></i>
          No se pudo conectar con el servidor. Asegúrate de que el backend esté corriendo en
          <strong>http://localhost:3100</strong>.
          <br><small>${err.message}</small>
        </div>
      </div>`;
  }
}

// ── Renderizado de página ─────────────────────────────────────────────────────

function renderPage() {
  const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const pageProducts = filtered.slice(start, start + PRODUCTS_PER_PAGE);

  renderProducts(pageProducts);
  renderPagination();
}

function renderProducts(products) {
  const container = document.getElementById('productList');

  if (products.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="fa fa-search fa-3x text-muted mb-3"></i>
        <p class="text-muted">No se encontraron productos con ese criterio.</p>
      </div>`;
    return;
  }

  container.innerHTML = products.map(p => `
    <div class="col-12 col-md-6 col-lg-4 col-xl-3">
      <div class="card h-100 shadow-sm">
        <img src="${p.imageUrl}" class="card-img-top" alt="${p.title}"
          style="height:200px; object-fit:cover;"
          onerror="this.src='https://via.placeholder.com/300x200?text=Sin+imagen'">
        <div class="card-body">
          <h5 class="card-title">${p.title}</h5>
          <h6 class="card-subtitle mb-2 text-muted">${p.category}</h6>
          <p class="card-text small text-muted">${p.description}</p>
          <p class="fw-bold text-primary mb-0">
            $${p.pricePerUnit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            <small class="text-muted fw-normal">/ ${p.unit}</small>
          </p>
        </div>
        <div class="card-footer text-end bg-white border-top-0">
          <button class="btn btn-outline-primary btn-sm"
            onclick="openAddModal(${JSON.stringify(p).replace(/"/g, '&quot;')})">
            <i class="fa fa-cart-plus me-1"></i>Agregar
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderPagination() {
  const totalPages = Math.ceil(filtered.length / PRODUCTS_PER_PAGE);
  const container = document.getElementById('pagination');

  if (totalPages <= 1) { container.innerHTML = ''; return; }

  let html = `
    <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" onclick="goToPage(${currentPage - 1})">
        <i class="fa fa-chevron-left"></i>
      </a>
    </li>`;

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <li class="page-item ${i === currentPage ? 'active' : ''}">
        <a class="page-link" href="#" onclick="goToPage(${i})">${i}</a>
      </li>`;
  }

  html += `
    <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
      <a class="page-link" href="#" onclick="goToPage(${currentPage + 1})">
        <i class="fa fa-chevron-right"></i>
      </a>
    </li>`;

  container.innerHTML = html;
}

function goToPage(page) {
  const totalPages = Math.ceil(filtered.length / PRODUCTS_PER_PAGE);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderPage();
  window.scrollTo({ top: document.getElementById('productList').offsetTop - 80, behavior: 'smooth' });
}

// ── Búsqueda / filtros ────────────────────────────────────────────────────────

function setupSearch() {
  const input = document.getElementById('searchInput');
  if (!input) return;

  input.addEventListener('input', () => {
    const query = input.value.toLowerCase().trim();
    filtered = allProducts.filter(p =>
      p.title.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    );
    currentPage = 1;
    renderPage();
  });
}

// ── Modal agregar al carrito ──────────────────────────────────────────────────

function openAddModal(product) {
  selectedProduct = product;

  document.getElementById('modalProductImg').src = product.imageUrl;
  document.getElementById('modalProductTitle').textContent = product.title;
  document.getElementById('modalProductDesc').textContent = product.description;
  document.getElementById('modalProductPrice').textContent =
    `$${product.pricePerUnit.toLocaleString('es-MX', { minimumFractionDigits: 2 })} / ${product.unit}`;
  document.getElementById('modalQty').value = 1;

  const modal = new bootstrap.Modal(document.getElementById('addToCartModal'));
  modal.show();
}

function confirmAddToCart() {
  if (!selectedProduct) return;

  const qty = parseInt(document.getElementById('modalQty').value);
  if (isNaN(qty) || qty < 1) return;

  addToCart(selectedProduct, qty);

  // Cerrar modal y mostrar toast de confirmación
  bootstrap.Modal.getInstance(document.getElementById('addToCartModal')).hide();
  showToast(`"${selectedProduct.title}" agregado al carrito ✓`);
}

// ── Toast de confirmación ─────────────────────────────────────────────────────

function showToast(message) {
  const toastEl = document.getElementById('cartToast');
  document.getElementById('cartToastMsg').textContent = message;
  new bootstrap.Toast(toastEl, { delay: 2500 }).show();
}
