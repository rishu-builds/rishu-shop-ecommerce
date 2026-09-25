/* ===== RISHU SHOP - MAIN JS ===== */

// Cart
const cart = {
  overlay: document.getElementById('cartOverlay'),
  sidebar: document.getElementById('cartSidebar'),

  open() {
    this.overlay?.classList.add('open');
    this.sidebar?.classList.add('open');
    this.load();
  },

  close() {
    this.overlay?.classList.remove('open');
    this.sidebar?.classList.remove('open');
  },

  async load() {
    const res = await fetch('ajax/cart.php?action=get');
    const data = await res.json();
    this.render(data);
  },

  render(data) {
    const container = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');
    const countEl = document.getElementById('cartCount');

    if (!container) return;

    if (!data.items || data.items.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🛒</div>
          <div class="empty-title">Cart is empty</div>
          <div class="empty-desc">Add some products to get started</div>
        </div>`;
      if (totalEl) totalEl.textContent = '₹0';
      if (countEl) countEl.textContent = '0';
      return;
    }

    container.innerHTML = data.items.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-img">
          ${item.image ? `<img src="uploads/products/${item.image}" alt="${item.name}" loading="lazy">` : `<div class="product-placeholder">👕</div>`}
        </div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">₹${parseFloat(item.price).toLocaleString('en-IN')}</div>
          <div class="cart-qty">
            <button class="qty-btn" onclick="cart.updateQty(${item.product_id}, ${item.quantity - 1})">−</button>
            <span class="qty-val">${item.quantity}</span>
            <button class="qty-btn" onclick="cart.updateQty(${item.product_id}, ${item.quantity + 1})">+</button>
          </div>
        </div>
      </div>
    `).join('');

    if (totalEl) totalEl.textContent = '₹' + parseFloat(data.total).toLocaleString('en-IN');
    if (countEl) countEl.textContent = data.items.reduce((a, i) => a + i.quantity, 0);
  },

  async add(productId) {
    const res = await fetch('ajax/cart.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add', product_id: productId })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Added to cart!', 'success');
      this.load();
    }
  },

  async updateQty(productId, qty) {
    if (qty < 1) { this.remove(productId); return; }
    const res = await fetch('ajax/cart.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', product_id: productId, quantity: qty })
    });
    const data = await res.json();
    if (data.success) this.load();
  },

  async remove(productId) {
    const res = await fetch('ajax/cart.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'remove', product_id: productId })
    });
    const data = await res.json();
    if (data.success) this.load();
  }
};

// Wishlist toggle
async function toggleWishlist(productId, btn) {
  const res = await fetch('ajax/wishlist.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product_id: productId })
  });
  const data = await res.json();
  if (data.success) {
    btn.classList.toggle('wishlisted', data.added);
    btn.title = data.added ? 'Remove from wishlist' : 'Add to wishlist';
    showToast(data.added ? 'Added to wishlist!' : 'Removed from wishlist', data.added ? 'success' : 'info');
  }
}

// Toast notification
function showToast(msg, type = 'success') {
  const existing = document.getElementById('toastEl');
  if (existing) existing.remove();

  const t = document.createElement('div');
  t.id = 'toastEl';
  t.style.cssText = `
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    background: ${type === 'success' ? 'rgba(200,255,0,0.9)' : type === 'error' ? 'rgba(255,107,107,0.9)' : 'rgba(255,255,255,0.1)'};
    color: ${type === 'success' ? '#000' : '#fff'};
    padding: 12px 24px; border-radius: 30px; font-weight: 600;
    font-family: 'DM Sans', sans-serif; font-size: 0.9rem;
    z-index: 1000; backdrop-filter: blur(10px);
    animation: slideUp 0.3s ease;
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  `;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// Broadcast popup
function initBroadcasts() {
  const popup = document.getElementById('broadcastPopup');
  if (!popup) return;

  fetch('ajax/broadcasts.php?action=unseen')
    .then(r => r.json())
    .then(data => {
      if (data.broadcasts && data.broadcasts.length > 0) {
        showBroadcast(data.broadcasts, 0, popup);
      }
    });
}

function showBroadcast(list, idx, popup) {
  if (idx >= list.length) return;
  const b = list[idx];
  popup.querySelector('.broadcast-title').textContent = b.title;
  popup.querySelector('.broadcast-msg').textContent = b.message;
  popup.classList.add('show');

  popup.querySelector('.broadcast-close').onclick = () => {
    markBroadcastSeen(b.id);
    popup.classList.remove('show');
    setTimeout(() => showBroadcast(list, idx + 1, popup), 500);
  };
}

function markBroadcastSeen(id) {
  fetch('ajax/broadcasts.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'mark_seen', broadcast_id: id })
  });
}

// Checkout modal
function openCheckout() {
  document.getElementById('checkoutModal')?.classList.add('open');
}

function closeCheckout() {
  document.getElementById('checkoutModal')?.classList.remove('open');
}

// Image lazy load
function initLazyLoad() {
  const imgs = document.querySelectorAll('img[loading="lazy"]');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.src = e.target.dataset.src || e.target.src;
        obs.unobserve(e.target);
      }
    });
  });
  imgs.forEach(img => obs.observe(img));
}

// Filter products
function filterProducts(cat) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');

  document.querySelectorAll('.product-card').forEach(card => {
    const cardCat = card.dataset.category;
    card.style.display = (cat === 'all' || cardCat === cat) ? '' : 'none';
  });
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  initLazyLoad();
  initBroadcasts();

  // Cart overlay click close
  document.getElementById('cartOverlay')?.addEventListener('click', () => cart.close());

  // ESC close modals
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      cart.close();
      closeCheckout();
      document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
    }
  });
});
