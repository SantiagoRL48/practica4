// js/admin.js
// CRUD completo de productos para la sección de administrador (admin.html).
// Usa las funciones de api.js para comunicarse con el backend.

let editingId = null; // id del producto que se está editando (null = crear)

document.addEventListener('DOMContentLoaded', async () => {
  await loadAdminProducts();
  setupAdminForm();
});

// ── Carga y renderizado ───────────────────────────────────────────────────────

async function loadAdminProducts() {
  const tbody = document.getElementById('adminTableBody');
  tbody.innerHTML = `<tr><td colspan="6" class="text-center py-3">
    <div class="spinner-border spinner-border-sm text-primary me-2"></div>Cargando...
  </td></tr>`;

  try {
    const products = await fetchProducts();
    renderAdminTable(products);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-danger text-center py-3">
      <i class="fa fa-exclamation-triangle me-2"></i>${err.message}
    </td></tr>`;
  }
}

function renderAdminTable(products) {
  const tbody = document.getElementById('adminTableBody');

  if (products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-3">
      No hay productos registrados.
    </td></tr>`;
    return;
  }

  tbody.innerHTML = products.map(p => `
    <tr>
      <td>
        <img src="${p.imageUrl}" alt="${p.title}"
          style="width:50px; height:50px; object-fit:cover;" class="rounded"
          onerror="this.src='https://via.placeholder.com/50'">
      </td>
      <td>${p.title}</td>
      <td><span class="badge bg-secondary">${p.category}</span></td>
      <td>$${p.pricePerUnit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
      <td>${p.stock ?? '—'}</td>
      <td>
        <button class="btn btn-outline-primary btn-sm me-1" onclick="openEditModal('${p.id}')">
          <i class="fa fa-pencil"></i>
        </button>
        <button class="btn btn-outline-danger btn-sm" onclick="openDeleteModal('${p.id}', '${p.title.replace(/'/g, "\\'")}')">
          <i class="fa fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

// ── Formulario de crear / editar ──────────────────────────────────────────────

function setupAdminForm() {
  document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
      imageUrl:     document.getElementById('fImageUrl').value.trim(),
      title:        document.getElementById('fTitle').value.trim(),
      description:  document.getElementById('fDescription').value.trim(),
      unit:         document.getElementById('fUnit').value.trim(),
      category:     document.getElementById('fCategory').value.trim(),
      pricePerUnit: parseFloat(document.getElementById('fPrice').value),
      stock:        parseInt(document.getElementById('fStock').value)
    };

    const btn = document.getElementById('formSubmitBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Guardando...';

    try {
      if (editingId) {
        await updateProduct(editingId, data);
        showAdminToast('Producto actualizado correctamente ✓');
      } else {
        await createProduct(data);
        showAdminToast('Producto creado correctamente ✓');
      }
      bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
      await loadAdminProducts();
    } catch (err) {
      document.getElementById('formError').textContent = err.message;
      document.getElementById('formError').classList.remove('d-none');
    } finally {
      btn.disabled = false;
      btn.innerHTML = editingId ? 'Guardar cambios' : 'Crear producto';
    }
  });
}

function openCreateModal() {
  editingId = null;
  document.getElementById('productModalTitle').textContent = 'Nuevo producto';
  document.getElementById('formSubmitBtn').textContent = 'Crear producto';
  document.getElementById('productForm').reset();
  document.getElementById('formError').classList.add('d-none');
  new bootstrap.Modal(document.getElementById('productModal')).show();
}

async function openEditModal(id) {
  editingId = id;
  document.getElementById('productModalTitle').textContent = 'Editar producto';
  document.getElementById('formSubmitBtn').textContent = 'Guardar cambios';
  document.getElementById('formError').classList.add('d-none');

  try {
    const p = await fetchProductById(id);
    document.getElementById('fImageUrl').value    = p.imageUrl;
    document.getElementById('fTitle').value       = p.title;
    document.getElementById('fDescription').value = p.description;
    document.getElementById('fUnit').value        = p.unit;
    document.getElementById('fCategory').value    = p.category;
    document.getElementById('fPrice').value       = p.pricePerUnit;
    document.getElementById('fStock').value       = p.stock;
    new bootstrap.Modal(document.getElementById('productModal')).show();
  } catch (err) {
    alert('No se pudo cargar el producto: ' + err.message);
  }
}

// ── Eliminar ──────────────────────────────────────────────────────────────────

let pendingDeleteId = null;

function openDeleteModal(id, title) {
  pendingDeleteId = id;
  document.getElementById('deleteProductName').textContent = `"${title}"`;
  new bootstrap.Modal(document.getElementById('deleteModal')).show();
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
    if (!pendingDeleteId) return;
    try {
      await deleteProduct(pendingDeleteId);
      bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
      showAdminToast('Producto eliminado ✓');
      await loadAdminProducts();
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  });
});

// ── Toast ─────────────────────────────────────────────────────────────────────

function showAdminToast(msg) {
  document.getElementById('adminToastMsg').textContent = msg;
  new bootstrap.Toast(document.getElementById('adminToast'), { delay: 3000 }).show();
}
