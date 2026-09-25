/* ===== ADMIN JS ===== */

// Toast
function showToast(msg, type = 'success') {
  const existing = document.getElementById('adminToast');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.id = 'adminToast';
  t.style.cssText = `
    position: fixed; top: 24px; right: 24px;
    background: ${type === 'success' ? 'rgba(200,255,0,0.9)' : 'rgba(255,107,107,0.9)'};
    color: ${type === 'success' ? '#000' : '#fff'};
    padding: 12px 24px; border-radius: 10px; font-weight: 600;
    font-family: 'DM Sans', sans-serif; font-size: 0.875rem;
    z-index: 9999; box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    animation: slideUp 0.3s ease;
  `;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// Update order status inline
async function updateOrderStatus(orderId, select) {
  const status = select.value;
  const res = await fetch('ajax/update-status.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order_id: orderId, status })
  });
  const data = await res.json();
  if (data.success) {
    showToast('Status updated!');
    // Update badge
    const row = select.closest('tr');
    const badge = row.querySelector('.status-badge');
    if (badge) {
      badge.className = 'status-badge ' + statusClass(status);
      badge.textContent = status;
    }
  } else {
    showToast('Update failed', 'error');
  }
}

function statusClass(s) {
  const map = {
    'Placed': 'status-placed',
    'Packed': 'status-packed',
    'Shipped': 'status-shipped',
    'Out for Delivery': 'status-out',
    'Delivered': 'status-delivered'
  };
  return map[s] || 'status-placed';
}

// Modal helpers
function openModal(id) { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

// Delete confirm
function confirmDelete(msg, action) {
  if (confirm(msg)) action();
}

// Toggle order detail row
function toggleOrderDetail(orderId) {
  const row = document.getElementById('detail-' + orderId);
  if (row) row.style.display = row.style.display === 'none' ? '' : 'none';
}

// Image preview
function previewImages(input) {
  const preview = document.getElementById('imgPreview');
  if (!preview) return;
  preview.innerHTML = '';
  [...input.files].forEach(file => {
    const url = URL.createObjectURL(file);
    const img = document.createElement('img');
    img.src = url;
    img.className = 'img-preview';
    preview.appendChild(img);
  });
}

// Confirm delete
document.querySelectorAll('[data-confirm]').forEach(btn => {
  btn.addEventListener('click', e => {
    if (!confirm(btn.dataset.confirm)) e.preventDefault();
  });
});

// ESC close modals
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  }
});
