/**
 * Rishu Shop - Client-Side E-Commerce Architecture
 * Author: Rishabh Yadav (https://github.com/rishu-builds)
 * Handles: State management, cart drawer, OTP auth flow, live search, 2-step checkout
 */

// Product catalog
const STORE_PRODUCTS = {
  shirt1: {
    id: 1, key: 'shirt1', name: 'Silk Luxe Shirt', category: 'Shirts',
    price: 1599, mrp: 2999, rating: 4.8, reviews: 1420,
    imgs: ['assets/shirt1.png', 'assets/shirt2.png'],
    desc: 'Woven from 100% grade-A mulberry silk, the Silk Luxe drapes with impossible softness. Built for boardrooms and late-night galleries.',
    tags: ['Silk', 'Relaxed Fit', 'SS2026', 'Bestseller']
  },
  shirt2: {
    id: 2, key: 'shirt2', name: 'Linen Cloud Shirt', category: 'Shirts',
    price: 1199, mrp: 2399, rating: 4.7, reviews: 890,
    imgs: ['assets/shirt2.png', 'assets/shirt1.png'],
    desc: 'Stone-washed Belgian linen — impossibly lightweight, structured at the shoulder, relaxed everywhere else. Summer redefined.',
    tags: ['Linen', 'Oversized', 'Sustainable']
  },
  shirt3: {
    id: 3, key: 'shirt3', name: 'Oversized Oxford', category: 'Shirts',
    price: 899, mrp: 1799, rating: 4.9, reviews: 2150,
    imgs: ['assets/shirt3.png', 'assets/shirt4.png'],
    desc: 'Classic Oxford cloth reimagined for the modern edit. Drop shoulders, a boxy silhouette, and a feel that gets better every wash.',
    tags: ['Cotton', 'Boxy Fit', 'Under ₹1500', 'Bestseller']
  },
  shirt4: {
    id: 4, key: 'shirt4', name: 'Resort Collar Shirt', category: 'Shirts',
    price: 999, mrp: 1999, rating: 4.6, reviews: 670,
    imgs: ['assets/shirt4.png', 'assets/shirt3.png'],
    desc: 'Open notch collar with flutter sleeve. Woven from ultra-fine cotton lawn for an effortless holiday feel all year round.',
    tags: ['Cotton Lawn', 'Open Collar', 'Resort', 'Under ₹1500']
  },
  shirt5: {
    id: 5, key: 'shirt5', name: 'Editorial Drop Shirt', category: 'Shirts',
    price: 1699, mrp: 3199, rating: 4.8, reviews: 940,
    imgs: ['assets/shirt5.png', 'assets/shirt1.png'],
    desc: 'A collaboration with Kai Möller. Deconstructed seams, asymmetric hem, and a weighted drape that makes every movement sculptural.',
    tags: ['Artist Collab', 'Limited', 'Statement']
  },
  jeans1: {
    id: 6, key: 'jeans1', name: 'Slim Stretch Denim', category: 'Denim',
    price: 1299, mrp: 2499, rating: 4.8, reviews: 3200,
    imgs: ['assets/jeans1.png', 'assets/jeans2.png'],
    desc: 'Our best-selling silhouette — tapered slim that flexes with your body using our proprietary 3% elastane blend.',
    tags: ['Stretch', 'Slim', 'Under ₹1500', 'Bestseller']
  },
  jeans2: {
    id: 7, key: 'jeans2', name: 'Wide Leg Denim', category: 'Denim',
    price: 1499, mrp: 2899, rating: 4.7, reviews: 1840,
    imgs: ['assets/jeans2.png', 'assets/jeans1.png'],
    desc: 'A full, generous leg opening cut from rigid 14.5oz denim. Photographs like a campaign and wears like an everyday uniform.',
    tags: ['Rigid', 'Wide Leg', '14.5oz', 'Under ₹1500']
  },
  jeans3: {
    id: 8, key: 'jeans3', name: 'Tapered Raw Denim', category: 'Denim',
    price: 1699, mrp: 3299, rating: 4.9, reviews: 1120,
    imgs: ['assets/jeans3.png', 'assets/jeans4.png'],
    desc: 'Unsanforized Japanese selvedge that moulds to your exact body over time. A living, breathing artisanal garment.',
    tags: ['Raw', 'Japanese', 'Selvedge', 'Tapered']
  },
  jeans4: {
    id: 9, key: 'jeans4', name: 'Relaxed Carpenter', category: 'Denim',
    price: 1399, mrp: 2699, rating: 4.6, reviews: 780,
    imgs: ['assets/jeans4.png', 'assets/jeans3.png'],
    desc: 'Vintage-inspired carpenter styling with hammer loop, utility pocket, and relaxed room to move freely in raw indigo wash.',
    tags: ['Carpenter', 'Relaxed', 'Under ₹1500']
  },
  jeans5: {
    id: 10, key: 'jeans5', name: 'Selvedge Wide Denim', category: 'Denim',
    price: 1899, mrp: 3699, rating: 4.9, reviews: 1560,
    imgs: ['assets/jeans5.png', 'assets/jeans1.png'],
    desc: 'Cone Mills x Rishu — 15oz selvedge denim cut into the widest silhouette in our range. A true collector piece.',
    tags: ['Cone Mills', 'Selvedge', 'Wide', 'Collector']
  }
};

// Available Promo Codes
const VALID_COUPONS = {
  'RISHU20': { type: 'percent', value: 20, desc: '20% OFF Everything' },
  'WELCOME500': { type: 'flat', value: 500, minOrder: 1500, desc: '₹500 OFF (Min ₹1,500)' },
  'CLUB500': { type: 'flat', value: 500, minOrder: 1299, desc: '₹500 VIP Member Discount' },
  'AYODHYA10': { type: 'percent', value: 10, desc: '10% Express Ayodhya Discount' }
};

// ===== 2. APP STATE =====
const State = {
  currentUser: JSON.parse(localStorage.getItem('rishu_logged_in_user') || 'null'),
  cart: JSON.parse(localStorage.getItem('rishu_cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('rishu_wishlist') || '[]'),
  appliedCoupon: JSON.parse(localStorage.getItem('rishu_coupon') || 'null'),
  orders: JSON.parse(localStorage.getItem('rishu_orders') || '[]'),
  selectedSize: 'M',
  quickViewProductKey: 'shirt1',
  userAddress: JSON.parse(localStorage.getItem('rishu_address') || JSON.stringify({
    fullName: '',
    phone: '',
    pincode: '224001',
    address: 'Near Ram Mandir Marg, Naya Ghat',
    city: 'Ayodhya',
    state: 'Uttar Pradesh',
    type: 'Home'
  })),
  currentCheckoutStep: 1,
  selectedPaymentMethod: 'Cash On Delivery',
  lastPlacedOrder: null,
  loginIntent: null,
  otpTargetPhone: null
};

// Helper: Save State
function saveCart() { localStorage.setItem('rishu_cart', JSON.stringify(State.cart)); }
function saveWishlist() { localStorage.setItem('rishu_wishlist', JSON.stringify(State.wishlist)); }
function saveCoupon() { localStorage.setItem('rishu_coupon', JSON.stringify(State.appliedCoupon)); }
function saveOrders() { localStorage.setItem('rishu_orders', JSON.stringify(State.orders)); }
function saveAddress() { localStorage.setItem('rishu_address', JSON.stringify(State.userAddress)); }

// ===== 3. TOAST NOTIFICATIONS =====
function showToast(message, icon = 'fa-circle-check') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'toast-msg';
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(15px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

// ===== 4. CART ENGINE =====
function addToCart(productKey, size = 'M', qty = 1, openDrawer = true) {
  const p = STORE_PRODUCTS[productKey];
  if (!p) return;

  const existingIndex = State.cart.findIndex(item => item.productKey === productKey && item.size === size);
  if (existingIndex > -1) {
    State.cart[existingIndex].qty += qty;
  } else {
    State.cart.push({
      productKey: p.key,
      productId: p.id,
      name: p.name,
      price: p.price,
      mrp: p.mrp,
      img: p.imgs[0],
      size: size,
      qty: qty
    });
  }

  saveCart();
  updateCartBadges();
  renderCartUI();
  showToast(`Added <strong>${p.name}</strong> (Size ${size}) to Cart!`, 'fa-bag-shopping');

  if (openDrawer) {
    openCartDrawer();
  }
}

function updateCartQty(index, delta) {
  if (!State.cart[index]) return;
  State.cart[index].qty += delta;
  if (State.cart[index].qty <= 0) {
    removeFromCart(index);
    return;
  }
  saveCart();
  updateCartBadges();
  renderCartUI();
}

function removeFromCart(index) {
  if (!State.cart[index]) return;
  const removedName = State.cart[index].name;
  State.cart.splice(index, 1);
  saveCart();
  updateCartBadges();
  renderCartUI();
  showToast(`Removed ${removedName} from cart`, 'fa-trash-can');
}

function getCartCalculations() {
  let totalMRP = 0;
  let subtotal = 0;
  let totalItems = 0;

  State.cart.forEach(item => {
    totalMRP += (item.mrp || item.price * 1.8) * item.qty;
    subtotal += item.price * item.qty;
    totalItems += item.qty;
  });

  const mrpDiscount = totalMRP - subtotal;
  let couponDiscount = 0;

  if (State.appliedCoupon) {
    const c = State.appliedCoupon;
    if (c.type === 'percent') {
      couponDiscount = Math.round((subtotal * c.value) / 100);
    } else if (c.type === 'flat') {
      couponDiscount = subtotal >= (c.minOrder || 0) ? c.value : 0;
    }
  }

  const shippingFee = subtotal >= 999 || totalItems === 0 ? 0 : 99;
  const finalTotal = Math.max(0, subtotal - couponDiscount + shippingFee);
  const totalSavings = mrpDiscount + couponDiscount + (subtotal >= 999 && totalItems > 0 ? 99 : 0);

  return {
    totalItems,
    totalMRP,
    subtotal,
    mrpDiscount,
    couponDiscount,
    shippingFee,
    finalTotal,
    totalSavings
  };
}

function applyPromoCode(codeStr) {
  const code = (codeStr || '').trim().toUpperCase();
  if (!code) {
    showToast('Please enter a coupon code', 'fa-triangle-exclamation');
    return;
  }
  if (!VALID_COUPONS[code]) {
    showToast(`Coupon <strong>${code}</strong> is invalid!`, 'fa-circle-xmark');
    return;
  }
  const coupon = VALID_COUPONS[code];
  const { subtotal } = getCartCalculations();
  if (coupon.minOrder && subtotal < coupon.minOrder) {
    showToast(`Order total must be at least ₹${coupon.minOrder} for ${code}`, 'fa-circle-exclamation');
    return;
  }

  State.appliedCoupon = { code, ...coupon };
  saveCoupon();
  renderCartUI();
  showToast(`🎉 Coupon <strong>${code}</strong> applied successfully!`, 'fa-tags');
}

function removePromoCode() {
  State.appliedCoupon = null;
  saveCoupon();
  renderCartUI();
  showToast('Coupon removed', 'fa-info-circle');
}

function updateCartBadges() {
  const totalItems = State.cart.reduce((sum, item) => sum + item.qty, 0);
  const cartBadge = document.getElementById('cartBadge');
  if (cartBadge) {
    cartBadge.textContent = totalItems;
    cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
  }

  const wishBadge = document.getElementById('wishBadge');
  if (wishBadge) {
    wishBadge.textContent = State.wishlist.length;
    wishBadge.style.display = State.wishlist.length > 0 ? 'flex' : 'none';
  }

  const ordersBadge = document.getElementById('ordersBadge');
  if (ordersBadge) {
    ordersBadge.textContent = State.orders.length;
    ordersBadge.style.display = State.orders.length > 0 ? 'flex' : 'none';
  }
}

function renderCartUI() {
  const cartList = document.getElementById('cart-items-list');
  const cartHeaderCount = document.getElementById('cart-header-count');
  const freeShippingFill = document.getElementById('shipping-fill');
  const freeShippingText = document.getElementById('shipping-text');
  const billSummary = document.getElementById('cart-bill-summary');
  const checkoutBtn = document.getElementById('cart-checkout-btn');

  if (!cartList) return;

  const totals = getCartCalculations();
  if (cartHeaderCount) cartHeaderCount.textContent = `${totals.totalItems} Items`;

  // Free shipping progress bar (Free above ₹999)
  if (freeShippingFill && freeShippingText) {
    if (totals.totalItems === 0) {
      freeShippingFill.style.width = '0%';
      freeShippingText.innerHTML = `Add ₹999 for <strong>FREE Delivery</strong>`;
    } else if (totals.subtotal >= 999) {
      freeShippingFill.style.width = '100%';
      freeShippingText.innerHTML = `🎉 <strong>Congratulations!</strong> You unlocked FREE Delivery`;
    } else {
      const needed = 999 - totals.subtotal;
      const pct = Math.min(100, Math.round((totals.subtotal / 999) * 100));
      freeShippingFill.style.width = `${pct}%`;
      freeShippingText.innerHTML = `Add <strong>₹${needed}</strong> more to unlock <strong>FREE Delivery</strong>`;
    }
  }

  // Empty Cart State
  if (State.cart.length === 0) {
    cartList.innerHTML = `
      <div class="empty-state-wrap">
        <i class="fa-solid fa-basket-shopping empty-state-icon"></i>
        <div class="empty-state-title">Your Bag is Empty</div>
        <div class="empty-state-subtitle">Explore our luxury drops and add your favourite pieces.</div>
        <button class="btn-card-buy" style="margin: 0 auto; padding: 10px 24px" onclick="closeCartDrawer(); document.getElementById('product-strip').scrollIntoView({behavior:'smooth'})">
          Explore Drops
        </button>
      </div>
    `;
    if (billSummary) billSummary.style.display = 'none';
    if (checkoutBtn) {
      checkoutBtn.disabled = true;
      checkoutBtn.style.opacity = '0.5';
      checkoutBtn.style.pointerEvents = 'none';
    }
    return;
  }

  // Render items
  cartList.innerHTML = State.cart.map((item, index) => `
    <div class="cart-item-card">
      <img src="${item.img}" alt="${item.name}" class="cart-item-thumb">
      <div class="cart-item-info">
        <div>
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-meta">
            <span>Size: <span class="size-badge">${item.size}</span></span>
            <span>• 100% Cotton / Silk</span>
          </div>
        </div>
        <div class="cart-item-pricing">
          <span class="cart-price">₹${item.price.toLocaleString('en-IN')}</span>
          <span class="cart-mrp">₹${item.mrp.toLocaleString('en-IN')}</span>
        </div>
        <div class="cart-item-actions">
          <div class="qty-stepper">
            <button class="qty-btn" onclick="updateCartQty(${index}, -1)" aria-label="Decrease quantity">−</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" onclick="updateCartQty(${index}, 1)" aria-label="Increase quantity">+</button>
          </div>
          <button class="cart-item-remove-btn" onclick="removeFromCart(${index})">
            <i class="fa-regular fa-trash-can"></i> Remove
          </button>
        </div>
      </div>
    </div>
  `).join('');

  // Render Coupon Section & Bill Summary
  if (billSummary) {
    billSummary.style.display = 'block';
    billSummary.innerHTML = `
      <!-- Coupon Box -->
      <div class="cart-coupon-box" style="margin-bottom: 14px">
        <div class="coupon-input-group">
          <input type="text" id="couponCodeInput" class="coupon-input" placeholder="Enter coupon code" value="${State.appliedCoupon ? State.appliedCoupon.code : ''}">
          <button class="coupon-apply-btn" onclick="applyPromoCode(document.getElementById('couponCodeInput').value)">Apply</button>
        </div>
        ${State.appliedCoupon ? `
          <div class="coupon-active-badge">
            <span><i class="fa-solid fa-tag"></i> <strong>${State.appliedCoupon.code}</strong> applied (-₹${totals.couponDiscount})</span>
            <span class="coupon-remove-link" onclick="removePromoCode()">Remove</span>
          </div>
        ` : `
          <div class="coupon-chips-list">
            <span class="coupon-chip-item" onclick="applyPromoCode('RISHU20')">🏷️ RISHU20 (20% OFF)</span>
            <span class="coupon-chip-item" onclick="applyPromoCode('WELCOME500')">🏷️ WELCOME500 (₹500 OFF)</span>
          </div>
        `}
      </div>

      <!-- Price Details -->
      <div class="bill-summary-box">
        <div class="bill-summary-title">Price Details (${totals.totalItems} Items)</div>
        <div class="bill-row">
          <span>Total MRP</span>
          <span>₹${totals.totalMRP.toLocaleString('en-IN')}</span>
        </div>
        <div class="bill-row green-text">
          <span>Discount on MRP</span>
          <span>− ₹${totals.mrpDiscount.toLocaleString('en-IN')}</span>
        </div>
        ${totals.couponDiscount > 0 ? `
          <div class="bill-row green-text">
            <span>Coupon Discount (${State.appliedCoupon.code})</span>
            <span>− ₹${totals.couponDiscount.toLocaleString('en-IN')}</span>
          </div>
        ` : ''}
        <div class="bill-row">
          <span>Delivery Charges</span>
          <span>${totals.shippingFee === 0 ? '<strong style="color:#34d399">FREE</strong> <span style="text-decoration:line-through;color:var(--text-muted);font-size:0.7rem">₹99</span>' : '₹99'}</span>
        </div>
        <div class="bill-row total-row">
          <span>Total Amount</span>
          <span>₹${totals.finalTotal.toLocaleString('en-IN')}</span>
        </div>
        <div class="savings-banner">
          💰 You will save ₹${totals.totalSavings.toLocaleString('en-IN')} on this order!
        </div>
      </div>
    `;
  }

  if (checkoutBtn) {
    checkoutBtn.disabled = false;
    checkoutBtn.style.opacity = '1';
    checkoutBtn.style.pointerEvents = 'auto';
    checkoutBtn.innerHTML = `<span>Place Order • ₹${totals.finalTotal.toLocaleString('en-IN')}</span> <i class="fa-solid fa-arrow-right"></i>`;
  }
}

// ===== 5. WISHLIST ENGINE =====
function toggleWishlist(productKey) {
  const p = STORE_PRODUCTS[productKey];
  if (!p) return;

  const idx = State.wishlist.indexOf(productKey);
  if (idx > -1) {
    State.wishlist.splice(idx, 1);
    showToast(`Removed <strong>${p.name}</strong> from Wishlist`, 'fa-heart-crack');
  } else {
    State.wishlist.push(productKey);
    showToast(`Saved <strong>${p.name}</strong> to Wishlist ❤️`, 'fa-heart');
  }

  saveWishlist();
  updateCartBadges();
  updateWishlistCardButtons();
  renderWishlistUI();
}

function updateWishlistCardButtons() {
  document.querySelectorAll('.wish-card-btn').forEach(btn => {
    const key = btn.dataset.product;
    if (State.wishlist.includes(key)) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function renderWishlistUI() {
  const wishListEl = document.getElementById('wishlist-items-list');
  const wishCountEl = document.getElementById('wishlist-header-count');
  if (!wishListEl) return;

  if (wishCountEl) wishCountEl.textContent = `${State.wishlist.length} Items`;

  if (State.wishlist.length === 0) {
    wishListEl.innerHTML = `
      <div class="empty-state-wrap">
        <i class="fa-regular fa-heart empty-state-icon"></i>
        <div class="empty-state-title">Your Wishlist is Empty</div>
        <div class="empty-state-subtitle">Save your favorite pieces here to purchase them later.</div>
      </div>
    `;
    return;
  }

  wishListEl.innerHTML = State.wishlist.map(key => {
    const p = STORE_PRODUCTS[key];
    if (!p) return '';
    return `
      <div class="cart-item-card">
        <img src="${p.imgs[0]}" alt="${p.name}" class="cart-item-thumb">
        <div class="cart-item-info">
          <div>
            <div class="cart-item-name">${p.name}</div>
            <div class="cart-item-meta">
              <span class="rating-pill">★ ${p.rating}</span>
              <span>${p.category}</span>
            </div>
          </div>
          <div class="cart-item-pricing">
            <span class="cart-price">₹${p.price.toLocaleString('en-IN')}</span>
            <span class="cart-mrp">₹${p.mrp.toLocaleString('en-IN')}</span>
          </div>
          <div class="cart-item-actions">
            <button class="btn-card-cart" style="padding: 5px 12px" onclick="addToCart('${p.key}', 'M', 1); toggleWishlist('${p.key}')">
              <i class="fa-solid fa-bag-shopping"></i> Move to Bag
            </button>
            <button class="cart-item-remove-btn" onclick="toggleWishlist('${p.key}')">
              <i class="fa-solid fa-xmark"></i> Remove
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ===== 6. QUICK VIEW / PRODUCT DETAILS MODAL =====
function openQuickViewModal(productKey) {
  const p = STORE_PRODUCTS[productKey];
  if (!p) return;

  State.quickViewProductKey = productKey;
  State.selectedSize = 'M';

  const overlay = document.getElementById('modal-overlay');
  const modalBox = document.getElementById('modal-box');
  if (!overlay || !modalBox) return;

  const imagesDiv = document.getElementById('modal-images');
  imagesDiv.innerHTML = p.imgs.map(imgSrc => `
    <img src="${imgSrc}" alt="${p.name}" style="flex:1;height:180px;object-fit:cover;border-radius:12px;background:rgba(0,0,0,0.3)">
  `).join('');

  document.getElementById('modal-name').textContent = p.name;
  document.getElementById('modal-desc').textContent = p.desc;
  document.getElementById('modal-tags').innerHTML = p.tags.map(t => `<span class="modal-tag">${t}</span>`).join('');

  // Add Flipkart interactive widgets inside modal: Price, Size chips, Delivery check
  let extraWrap = document.getElementById('modal-flipkart-addons');
  if (!extraWrap) {
    extraWrap = document.createElement('div');
    extraWrap.id = 'modal-flipkart-addons';
    const descEl = document.getElementById('modal-desc');
    descEl.parentNode.insertBefore(extraWrap, descEl.nextSibling);
  }

  const discountPercent = Math.round(((p.mrp - p.price) / p.mrp) * 100);

  extraWrap.innerHTML = `
    <!-- Price Row -->
    <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:14px">
      <span style="font-size:1.6rem;font-weight:900;color:#fff">₹${p.price.toLocaleString('en-IN')}</span>
      <span style="font-size:0.95rem;color:var(--text-muted);text-decoration:line-through">₹${p.mrp.toLocaleString('en-IN')}</span>
      <span class="discount-pill" style="font-size:0.75rem">${discountPercent}% OFF</span>
    </div>

    <!-- Size Selector -->
    <div style="margin-bottom:16px">
      <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:8px">Select Size</div>
      <div style="display:flex;gap:10px" id="modal-size-picker">
        ${['S', 'M', 'L', 'XL'].map(s => `
          <button class="addr-type-chip ${s === State.selectedSize ? 'active' : ''}" style="width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700" onclick="selectModalSize('${s}', this)">
            ${s}
          </button>
        `).join('')}
      </div>
    </div>

    <!-- Pincode / Delivery Estimator -->
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(212,168,255,0.15);border-radius:12px;padding:10px 14px;margin-bottom:18px;display:flex;align-items:center;gap:10px">
      <i class="fa-solid fa-truck-fast" style="color:var(--purple);font-size:1.1rem"></i>
      <div style="font-size:0.78rem">
        <div style="color:#fff;font-weight:700">Delivering to Ayodhya (224001)</div>
        <div style="color:#34d399">⚡ FREE Delivery within 2-4 days</div>
      </div>
    </div>
  `;

  // Replace default button with 2 buttons: "Add to Bag" and "Buy Now"
  const defaultBtn = document.querySelector('.modal-add-btn');
  if (defaultBtn) {
    defaultBtn.outerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <button class="btn-card-cart" style="padding:14px;font-size:0.9rem;border-radius:50px" onclick="addToCart('${p.key}', State.selectedSize, 1); closeQuickViewModal()">
          <i class="fa-solid fa-bag-shopping"></i> Add to Bag
        </button>
        <button class="btn-card-buy" style="padding:14px;font-size:0.9rem;border-radius:50px" onclick="buyNowFromModal('${p.key}')">
          <i class="fa-solid fa-bolt"></i> ⚡ Buy Now
        </button>
      </div>
    `;
  }

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function selectModalSize(size, btnEl) {
  State.selectedSize = size;
  document.querySelectorAll('#modal-size-picker .addr-type-chip').forEach(b => b.classList.remove('active'));
  btnEl.classList.add('active');
}

function closeQuickViewModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function buyNowFromModal(productKey) {
  addToCart(productKey, State.selectedSize, 1, false);
  closeQuickViewModal();
  openCheckoutModal();
}

function buyNowDirect(productKey) {
  addToCart(productKey, 'M', 1, false);
  openCheckoutModal();
}

// ===== 7. 2-STEP CHECKOUT ENGINE =====
function openCheckoutModal() {
  if (State.cart.length === 0) {
    showToast('Your bag is empty. Add items first!', 'fa-circle-exclamation');
    return;
  }
  if (!State.currentUser) {
    closeCartDrawer();
    openLoginModal('checkout');
    showToast('Please log in with your mobile number to checkout', 'fa-arrow-right-to-bracket');
    return;
  }
  closeCartDrawer();
  State.currentCheckoutStep = 1;
  const modal = document.getElementById('checkout-modal');
  if (modal) modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  renderCheckoutStep();
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

function renderCheckoutStep() {
  const body = document.getElementById('checkout-body');
  const step1Ind = document.getElementById('step-indicator-1');
  const step2Ind = document.getElementById('step-indicator-2');
  const totals = getCartCalculations();

  if (!body) return;

  if (State.currentCheckoutStep === 1) {
    step1Ind.classList.add('active');
    step2Ind.classList.remove('active');

    const a = State.userAddress;
    body.innerHTML = `
      <div style="font-size:1.15rem;font-weight:800;color:#fff;margin-bottom:14px">
        <i class="fa-solid fa-location-dot" style="color:var(--purple);margin-right:8px"></i> Delivery Address
      </div>

      <div class="form-group-row">
        <div class="form-group">
          <label class="form-label">Full Name *</label>
          <input type="text" id="chkName" class="form-input" value="${a.fullName || 'Rishabh Yadav'}">
        </div>
        <div class="form-group">
          <label class="form-label">Phone Number *</label>
          <input type="tel" id="chkPhone" class="form-input" value="${a.phone || '7607718791'}">
        </div>
      </div>

      <div class="form-group-row">
        <div class="form-group">
          <label class="form-label">Pincode *</label>
          <input type="text" id="chkPincode" class="form-input" value="${a.pincode || '224001'}">
        </div>
        <div class="form-group">
          <label class="form-label">City *</label>
          <input type="text" id="chkCity" class="form-input" value="${a.city || 'Ayodhya'}">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">House No / Building / Street Address *</label>
        <input type="text" id="chkAddress" class="form-input" value="${a.address || 'Near Ram Mandir Marg, Naya Ghat'}">
      </div>

      <div class="form-group">
        <label class="form-label">State</label>
        <input type="text" id="chkState" class="form-input" value="${a.state || 'Uttar Pradesh'}">
      </div>

      <div class="form-group">
        <label class="form-label">Address Type</label>
        <div class="addr-type-group">
          <button class="addr-type-chip ${a.type === 'Home' ? 'active' : ''}" onclick="setAddressType('Home', this)">🏠 Home (All-day Delivery)</button>
          <button class="addr-type-chip ${a.type === 'Work' ? 'active' : ''}" onclick="setAddressType('Work', this)">💼 Work (10 AM - 6 PM)</button>
        </div>
      </div>

      <div style="border-top:1px solid rgba(212,168,255,0.15);padding-top:18px;margin-top:20px;display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-size:0.75rem;color:var(--text-muted)">Total Payable</div>
          <div style="font-size:1.25rem;font-weight:800;color:#fff">₹${totals.finalTotal.toLocaleString('en-IN')}</div>
        </div>
        <button class="btn-checkout-cta" style="width:auto;padding:12px 28px" onclick="proceedToPaymentStep()">
          Deliver to This Address <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    `;
  } else {
    // Step 2: Payment
    step1Ind.classList.remove('active');
    step2Ind.classList.add('active');

    body.innerHTML = `
      <div style="font-size:1.15rem;font-weight:800;color:#fff;margin-bottom:14px">
        <i class="fa-solid fa-credit-card" style="color:var(--purple);margin-right:8px"></i> Select Payment Option
      </div>

      <div class="payment-cards-list">
        <!-- Option 1: Cash On Delivery -->
        <div class="payment-card-opt ${State.selectedPaymentMethod === 'Cash On Delivery' ? 'selected' : ''}" onclick="selectPaymentMethod('Cash On Delivery')">
          <div class="payment-opt-top">
            <div class="payment-opt-left">
              <input type="radio" name="paymethod" class="payment-radio" ${State.selectedPaymentMethod === 'Cash On Delivery' ? 'checked' : ''}>
              <div>
                <div class="payment-opt-title">💵 Cash On Delivery (COD)</div>
                <div class="payment-opt-desc">Pay cash or scan QR when package arrives at your door in Ayodhya</div>
              </div>
            </div>
            <span class="badge-pill" style="background:#10b981;color:#fff;font-size:0.65rem">Recommended</span>
          </div>
        </div>

        <!-- Option 2: Instant UPI Simulator -->
        <div class="payment-card-opt ${State.selectedPaymentMethod === 'Instant UPI' ? 'selected' : ''}" onclick="selectPaymentMethod('Instant UPI')">
          <div class="payment-opt-top">
            <div class="payment-opt-left">
              <input type="radio" name="paymethod" class="payment-radio" ${State.selectedPaymentMethod === 'Instant UPI' ? 'checked' : ''}>
              <div>
                <div class="payment-opt-title">⚡ Instant UPI / QR Code</div>
                <div class="payment-opt-desc">Google Pay, PhonePe, Paytm, BHIM, Cred</div>
              </div>
            </div>
            <span class="badge-pill" style="background:var(--purple);color:#0c0120;font-size:0.65rem">Instant</span>
          </div>

          <div class="upi-sim-box ${State.selectedPaymentMethod === 'Instant UPI' ? 'show' : ''}">
            <div class="upi-qr-wrap">
              <div class="upi-timer-text"><i class="fa-regular fa-clock"></i> QR Expires in: <span id="upiTimer">03:00</span></div>
              <div class="upi-qr-img">
                <!-- High quality QR SVG -->
                <svg viewBox="0 0 100 100" width="130" height="130">
                  <path fill="#0c0120" d="M0,0 h30 v30 h-30 z M6,6 h18 v18 h-18 z M10,10 h10 v10 h-10 z M70,0 h30 v30 h-30 z M76,6 h18 v18 h-18 z M80,10 h10 v10 h-10 z M0,70 h30 v30 h-30 z M6,76 h18 v18 h-18 z M10,80 h10 v10 h-10 z M40,10 h10 v10 h-10 z M55,10 h10 v10 h-10 z M40,25 h15 v5 h-15 z M10,40 h15 v10 h-15 z M35,40 h20 v20 h-20 z M45,45 h5 v10 h-5 z M70,40 h10 v15 h-10 z M85,40 h15 v10 h-15 z M70,60 h15 v10 h-15 z M40,70 h10 v20 h-10 z M55,70 h20 v10 h-20 z M70,85 h30 v15 h-30 z M85,75 h15 v5 h-15 z M25,85 h10 v10 h-10 z"/>
                </svg>
              </div>
              <div class="upi-apps-icons">
                <i class="fa-brands fa-google-pay" title="Google Pay"></i>
                <i class="fa-solid fa-mobile-screen" title="PhonePe"></i>
                <i class="fa-solid fa-wallet" title="Paytm"></i>
                <i class="fa-solid fa-building-columns" title="BHIM"></i>
              </div>
              <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:8px">UPI ID: <strong>rishu@okhdfcbank</strong></div>
            </div>
          </div>
        </div>

        <!-- Option 3: Cards -->
        <div class="payment-card-opt ${State.selectedPaymentMethod === 'Card' ? 'selected' : ''}" onclick="selectPaymentMethod('Card')">
          <div class="payment-opt-top">
            <div class="payment-opt-left">
              <input type="radio" name="paymethod" class="payment-radio" ${State.selectedPaymentMethod === 'Card' ? 'checked' : ''}>
              <div>
                <div class="payment-opt-title">💳 Credit / Debit Card</div>
                <div class="payment-opt-desc">Visa, Mastercard, RuPay, Diners</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div style="border-top:1px solid rgba(212,168,255,0.15);padding-top:18px;display:flex;justify-content:space-between;align-items:center">
        <button class="btn-success-ghost" onclick="backToAddressStep()">
          <i class="fa-solid fa-arrow-left"></i> Change Address
        </button>
        <button class="btn-checkout-cta" style="width:auto;padding:12px 28px" id="placeOrderFinalBtn" onclick="confirmAndPlaceOrder()">
          <i class="fa-solid fa-lock"></i> Place Order (₹${totals.finalTotal.toLocaleString('en-IN')})
        </button>
      </div>
    `;

    if (State.selectedPaymentMethod === 'Instant UPI') {
      startUpiCountdown();
    }
  }
}

function setAddressType(type, btnEl) {
  State.userAddress.type = type;
  document.querySelectorAll('.addr-type-group .addr-type-chip').forEach(b => b.classList.remove('active'));
  btnEl.classList.add('active');
}

function proceedToPaymentStep() {
  const name = document.getElementById('chkName').value.trim();
  const phone = document.getElementById('chkPhone').value.trim();
  const pincode = document.getElementById('chkPincode').value.trim();
  const city = document.getElementById('chkCity').value.trim();
  const address = document.getElementById('chkAddress').value.trim();
  const state = document.getElementById('chkState').value.trim();

  if (!name || !phone || !pincode || !address) {
    showToast('Please fill all required address fields', 'fa-triangle-exclamation');
    return;
  }

  State.userAddress = {
    fullName: name,
    phone: phone,
    pincode: pincode,
    city: city,
    address: address,
    state: state,
    type: State.userAddress.type || 'Home'
  };
  saveAddress();

  State.currentCheckoutStep = 2;
  renderCheckoutStep();
}

function backToAddressStep() {
  State.currentCheckoutStep = 1;
  renderCheckoutStep();
}

function selectPaymentMethod(method) {
  State.selectedPaymentMethod = method;
  renderCheckoutStep();
}

let upiInterval = null;
function startUpiCountdown() {
  if (upiInterval) clearInterval(upiInterval);
  let seconds = 180;
  const timerEl = document.getElementById('upiTimer');
  upiInterval = setInterval(() => {
    seconds--;
    if (seconds <= 0) {
      clearInterval(upiInterval);
      if (timerEl) timerEl.textContent = 'Expired';
    } else {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      if (timerEl) timerEl.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
  }, 1000);
}

// ===== 8. PLACE ORDER & SYNC WITH SQLITE BACKEND =====
async function confirmAndPlaceOrder() {
  const btn = document.getElementById('placeOrderFinalBtn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Placing Order...`;
  }

  const totals = getCartCalculations();
  const payload = {
    full_name: State.userAddress.fullName,
    phone: State.userAddress.phone,
    address: State.userAddress.address,
    city: State.userAddress.city,
    state: State.userAddress.state,
    postal_code: State.userAddress.pincode,
    payment_method: State.selectedPaymentMethod,
    total_price: totals.finalTotal,
    items: State.cart.map(item => ({
      product_id: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.qty,
      size: item.size,
      image: item.img
    }))
  };

  try {
    const response = await fetch('api/place_order.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();

    if (result.success) {
      handleOrderSuccess(result, totals);
    } else {
      throw new Error(result.error || 'Server rejected order');
    }
  } catch (err) {
    console.warn('API place_order notice:', err);
    // Offline / fallback order generation
    const mockOrderCode = 'RS-' + Math.floor(10000 + Math.random() * 90000);
    handleOrderSuccess({
      success: true,
      order_code: mockOrderCode,
      order_id: Math.floor(100 + Math.random() * 900),
      total_price: totals.finalTotal,
      status: 'Order Placed',
      created_at: new Date().toISOString(),
      delivery_date: new Date(Date.now() + 4 * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    }, totals);
  }
}

function handleOrderSuccess(res, totals) {
  closeCheckoutModal();

  const newOrder = {
    orderCode: res.order_code,
    orderId: res.order_id,
    date: res.created_at || new Date().toISOString(),
    deliveryDate: res.delivery_date,
    items: [...State.cart],
    totalPrice: totals.finalTotal,
    paymentMethod: State.selectedPaymentMethod,
    status: 'Order Placed',
    address: State.userAddress
  };

  State.orders.unshift(newOrder);
  saveOrders();
  State.lastPlacedOrder = newOrder;

  // Clear Cart
  State.cart = [];
  State.appliedCoupon = null;
  saveCart();
  saveCoupon();
  updateCartBadges();
  renderCartUI();

  // Show Success Modal & Confetti
  openOrderSuccessModal(newOrder);
}

// ===== 9. FLIPKART LIVE ORDER TRACKING & SUCCESS MODAL =====
function openOrderSuccessModal(order) {
  const modal = document.getElementById('order-success-modal');
  if (!modal) return;

  document.getElementById('successOrderCode').textContent = `Order Code: #${order.orderCode}`;
  document.getElementById('successDeliveryDate').textContent = `Expected Delivery: ${order.deliveryDate || 'Within 4 Days'} to Ayodhya`;
  document.getElementById('successCustomerName').textContent = `${order.address.fullName} • +91 ${order.address.phone}`;
  document.getElementById('successCustomerAddress').textContent = `${order.address.address}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}`;
  document.getElementById('successPaymentInfo').textContent = `${order.paymentMethod} • ₹${order.totalPrice.toLocaleString('en-IN')}`;

  // Update Stepper to Order Placed / Confirmed stage
  updateTrackingStepper(order.status || 'Order Placed');

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Fire celebratory Confetti
  launchConfetti();
}

function closeOrderSuccessModal() {
  const modal = document.getElementById('order-success-modal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

function updateTrackingStepper(status) {
  const line = document.getElementById('stepperProgressLine');
  const n1 = document.getElementById('node-1');
  const n2 = document.getElementById('node-2');
  const n3 = document.getElementById('node-3');
  const n4 = document.getElementById('node-4');
  const n5 = document.getElementById('node-5');

  const nodes = [n1, n2, n3, n4, n5];
  nodes.forEach(n => { if (n) { n.classList.remove('completed', 'active'); } });

  let progressPct = '0%';
  if (status === 'Order Placed' || status === 'Order Confirmed') {
    if (n1) n1.classList.add('completed');
    if (n2) n2.classList.add('active');
    progressPct = '25%';
  } else if (status === 'Packed') {
    if (n1) n1.classList.add('completed');
    if (n2) n2.classList.add('completed');
    if (n3) n3.classList.add('active');
    progressPct = '50%';
  } else if (status === 'Shipped') {
    if (n1) n1.classList.add('completed');
    if (n2) n2.classList.add('completed');
    if (n3) n3.classList.add('completed');
    if (n4) n4.classList.add('active');
    progressPct = '75%';
  } else if (status === 'Out For Delivery' || status === 'Out for Delivery') {
    if (n1) n1.classList.add('completed');
    if (n2) n2.classList.add('completed');
    if (n3) n3.classList.add('completed');
    if (n4) n4.classList.add('completed');
    if (n5) n5.classList.add('active');
    progressPct = '90%';
  } else if (status === 'Delivered') {
    nodes.forEach(n => { if (n) n.classList.add('completed'); });
    progressPct = '100%';
  }

  if (line) line.style.width = progressPct;
}

// ===== 10. MY ORDERS DRAWER =====
async function openOrdersDrawer() {
  if (!State.currentUser) {
    openLoginModal('orders');
    showToast('Please log in with your mobile number to view orders', 'fa-arrow-right-to-bracket');
    return;
  }
  const overlay = document.getElementById('orders-drawer-overlay');
  if (overlay) overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  await syncBackendOrders();
  renderOrdersUI();
}

function closeOrdersDrawer() {
  const overlay = document.getElementById('orders-drawer-overlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

async function syncBackendOrders() {
  try {
    const res = await fetch('api/get_orders.php');
    const data = await res.json();
    if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
      // Merge backend orders
      const backendMapped = data.orders.map(o => ({
        orderCode: 'RS-' + o.id,
        orderId: o.id,
        date: o.created_at,
        deliveryDate: 'Within 4 Days',
        items: [{
          name: o.product_name || 'Rishu Drop Garment',
          price: parseFloat(o.total_price) / (parseInt(o.quantity) || 1),
          mrp: (parseFloat(o.total_price) * 1.8) / (parseInt(o.quantity) || 1),
          img: o.product_images ? JSON.parse(o.product_images)[0] : 'assets/shirt1.png',
          size: o.address && o.address.includes('Size:') ? o.address.split('Size:')[1].split(']')[0].trim() : 'M',
          qty: parseInt(o.quantity) || 1
        }],
        totalPrice: parseFloat(o.total_price),
        paymentMethod: o.payment_method || 'Cash On Delivery',
        status: o.status || 'Order Placed',
        address: {
          fullName: o.full_name,
          phone: o.phone,
          address: o.address,
          city: o.city,
          state: o.state,
          pincode: o.postal_code
        }
      }));

      // Combine with local orders (deduplicate by orderId)
      const existingIds = new Set(backendMapped.map(b => b.orderId));
      const filteredLocal = State.orders.filter(l => !existingIds.has(l.orderId));
      State.orders = [...backendMapped, ...filteredLocal];
      saveOrders();
      updateCartBadges();
    }
  } catch (e) {
    console.warn('Backend sync offline:', e);
  }
}

function renderOrdersUI() {
  const listEl = document.getElementById('orders-history-list');
  const countEl = document.getElementById('orders-header-count');
  if (!listEl) return;

  if (countEl) countEl.textContent = `${State.orders.length} Orders`;

  if (State.orders.length === 0) {
    listEl.innerHTML = `
      <div class="empty-state-wrap">
        <i class="fa-solid fa-box-open empty-state-icon"></i>
        <div class="empty-state-title">No Orders Yet</div>
        <div class="empty-state-subtitle">Your placed orders will show up here with live dispatch tracking.</div>
      </div>
    `;
    return;
  }

  listEl.innerHTML = State.orders.map(order => {
    const firstItem = order.items && order.items[0] ? order.items[0] : { name: 'Rishu Garment', img: 'assets/shirt1.png', qty: 1 };
    const dateFormatted = new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const statusClass = (order.status || 'Order Placed').toLowerCase().replace(/\s+/g, '-');

    return `
      <div class="order-history-card">
        <div class="order-card-header">
          <div>
            <div class="order-card-code">#${order.orderCode}</div>
            <div class="order-card-date">Ordered on ${dateFormatted}</div>
          </div>
          <span class="order-status-badge status-${statusClass}">${order.status || 'Order Placed'}</span>
        </div>

        <div style="display:flex;gap:12px;align-items:center;margin-bottom:12px">
          <img src="${firstItem.img}" alt="${firstItem.name}" style="width:55px;height:55px;border-radius:8px;object-fit:cover;background:#000">
          <div style="flex:1">
            <div style="font-weight:700;font-size:0.88rem;color:#fff">${firstItem.name} ${order.items && order.items.length > 1 ? `<span style="color:var(--purple);font-size:0.75rem">+${order.items.length - 1} more</span>` : ''}</div>
            <div style="font-size:0.74rem;color:var(--text-muted)">Qty: ${firstItem.qty} • Size: ${firstItem.size || 'M'}</div>
            <div style="font-weight:800;font-size:0.92rem;color:var(--purple);margin-top:2px">₹${order.totalPrice.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div style="display:flex;gap:8px;border-top:1px solid rgba(212,168,255,0.1);padding-top:10px">
          <button class="btn-card-cart" style="flex:1;padding:6px;font-size:0.75rem" onclick="trackSingleOrder('${order.orderCode}')">
            <i class="fa-solid fa-location-crosshairs"></i> Track Order
          </button>
          <button class="btn-success-ghost" style="padding:6px 12px;font-size:0.75rem;border-radius:10px" onclick="printInvoice('${order.orderCode}')">
            <i class="fa-solid fa-file-invoice"></i> Invoice
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function trackSingleOrder(orderCode) {
  const order = State.orders.find(o => o.orderCode === orderCode);
  if (!order) return;
  closeOrdersDrawer();
  openOrderSuccessModal(order);
}

// ===== 11. PRINTABLE GST TAX INVOICE GENERATOR =====
function printInvoice(orderCode) {
  const order = State.orders.find(o => o.orderCode === orderCode) || State.lastPlacedOrder;
  if (!order) return;

  const dateStr = new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const invoiceNum = `INV-${order.orderCode.replace('RS-', '')}-${new Date().getFullYear()}`;

  const invoiceWindow = window.open('', '_blank');
  invoiceWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Tax Invoice - ${invoiceNum} - Rishu Shop</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; color: #1e293b; }
        .invoice-card { max-width: 800px; margin: 0 auto; border: 1px solid #cbd5e1; padding: 30px; border-radius: 12px; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #7c3aed; padding-bottom: 20px; margin-bottom: 20px; }
        .brand { font-size: 26px; font-weight: 900; color: #581c87; letter-spacing: -0.5px; }
        .brand span { color: #db2777; }
        .inv-title { font-size: 20px; font-weight: 700; text-align: right; color: #334155; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; font-size: 13px; line-height: 1.6; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
        th { background: #f8fafc; text-align: left; padding: 10px; border-bottom: 2px solid #e2e8f0; color: #475569; }
        td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
        .totals-table { margin-left: auto; width: 300px; }
        .totals-table td { padding: 6px 10px; }
        .total-highlight { font-size: 16px; font-weight: 800; color: #581c87; border-top: 2px solid #7c3aed; }
        .badge { background: #dcfce7; color: #15803d; padding: 3px 8px; border-radius: 4px; font-weight: 700; font-size: 11px; }
        .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        .print-btn { background: #7c3aed; color: #fff; border: none; padding: 10px 24px; border-radius: 6px; font-weight: 700; cursor: pointer; margin-bottom: 20px; }
        @media print { .no-print { display: none; } body { margin: 0; } .invoice-card { border: none; padding: 0; } }
      </style>
    </head>
    <body>
      <div class="no-print" style="text-align:right; max-width:800px; margin: 0 auto 10px;">
        <button class="print-btn" onclick="window.print()">🖨️ Print / Download PDF</button>
      </div>

      <div class="invoice-card">
        <div class="header">
          <div>
            <div class="brand">RISHU <span>SHOP</span></div>
            <div style="font-size:12px;color:#64748b;margin-top:4px">Premium Shirts & Denim Editorial</div>
            <div style="font-size:11px;color:#64748b">Ayodhya Hub, Uttar Pradesh 224001 • GSTIN: 09AAECR1234F1Z5</div>
          </div>
          <div>
            <div class="inv-title">TAX INVOICE</div>
            <div style="font-size:12px;color:#64748b;text-align:right"><strong>Invoice No:</strong> ${invoiceNum}</div>
            <div style="font-size:12px;color:#64748b;text-align:right"><strong>Date:</strong> ${dateStr}</div>
            <div style="text-align:right;margin-top:6px"><span class="badge">PAID / CONFIRMED</span></div>
          </div>
        </div>

        <div class="grid-2">
          <div>
            <strong style="color:#0f172a">Billed & Shipped To:</strong><br>
            <strong>${order.address.fullName}</strong><br>
            Phone: +91 ${order.address.phone}<br>
            ${order.address.address}<br>
            ${order.address.city}, ${order.address.state} - ${order.address.pincode}<br>
            Place of Supply: Uttar Pradesh (09)
          </div>
          <div>
            <strong style="color:#0f172a">Order Details:</strong><br>
            Order Reference: <strong>#${order.orderCode}</strong><br>
            Payment Mode: <strong>${order.paymentMethod}</strong><br>
            Delivery Partner: Express Courier Surface<br>
            Expected Dispatch: Immediate
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Product Description</th>
              <th>Size</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map((item, i) => `
              <tr>
                <td>${i + 1}</td>
                <td><strong>${item.name}</strong><br><span style="font-size:11px;color:#64748b">HSN: 6205 | Premium Garment</span></td>
                <td><span style="background:#f1f5f9;padding:2px 6px;border-radius:4px;font-weight:600">${item.size || 'M'}</span></td>
                <td>${item.qty}</td>
                <td>₹${item.price.toLocaleString('en-IN')}</td>
                <td>₹${(item.price * item.qty).toLocaleString('en-IN')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <table class="totals-table">
          <tr>
            <td>Subtotal:</td>
            <td style="text-align:right">₹${order.totalPrice.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td>Delivery Charges:</td>
            <td style="text-align:right;color:#15803d">FREE</td>
          </tr>
          <tr>
            <td>Integrated GST (12% Included):</td>
            <td style="text-align:right">₹${Math.round(order.totalPrice * 0.12).toLocaleString('en-IN')}</td>
          </tr>
          <tr class="total-highlight">
            <td>Grand Total:</td>
            <td style="text-align:right">₹${order.totalPrice.toLocaleString('en-IN')}</td>
          </tr>
        </table>

        <div class="footer">
          Thank you for shopping with <strong>Rishu Shop</strong>! Handcrafted with precision for the boldly modern.<br>
          For queries or support, reach out to Rishabh Yadav at ysrishabh017@gmail.com or WhatsApp: +91 7607718791.<br>
          <em>This is a computer generated invoice and requires no physical signature.</em>
        </div>
      </div>
    </body>
    </html>
  `);
  invoiceWindow.document.close();
}

// ===== 12. SEARCH & FILTER ENGINE =====
function initSearchAndFilter() {
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('searchClearBtn');

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      if (clearBtn) clearBtn.style.display = q ? 'block' : 'none';
      filterProductsBySearch(q);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        clearBtn.style.display = 'none';
        filterProductsBySearch('');
      }
    });
  }

  // Filter chips click
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const cat = chip.dataset.category;
      filterProductsByCategory(cat);
    });
  });
}

function filterProductsBySearch(query) {
  const cards = document.querySelectorAll('#product-strip .product-card');
  let matchCount = 0;

  cards.forEach(card => {
    const key = card.dataset.product;
    const p = STORE_PRODUCTS[key];
    if (!p) return;

    const haystack = `${p.name} ${p.category} ${p.tags.join(' ')} ${p.desc}`.toLowerCase();
    if (!query || haystack.includes(query)) {
      card.style.display = 'flex';
      matchCount++;
    } else {
      card.style.display = 'none';
    }
  });

  const emptyMsg = document.getElementById('no-search-results');
  if (emptyMsg) {
    emptyMsg.style.display = matchCount === 0 ? 'block' : 'none';
  }
}

function filterProductsByCategory(category) {
  const cards = document.querySelectorAll('#product-strip .product-card');
  let matchCount = 0;

  cards.forEach(card => {
    const key = card.dataset.product;
    const p = STORE_PRODUCTS[key];
    if (!p) return;

    let match = false;
    if (category === 'all') match = true;
    else if (category === 'shirts' && p.category === 'Shirts') match = true;
    else if (category === 'denim' && p.category === 'Denim') match = true;
    else if (category === 'under-1500' && p.price <= 1500) match = true;
    else if (category === 'bestseller' && p.rating >= 4.8) match = true;

    if (match) {
      card.style.display = 'flex';
      matchCount++;
    } else {
      card.style.display = 'none';
    }
  });
}

// ===== 13. DRAWER OPEN/CLOSE HELPERS =====
function openCartDrawer() {
  const overlay = document.getElementById('cart-drawer-overlay');
  if (overlay) overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  renderCartUI();
}

function closeCartDrawer() {
  const overlay = document.getElementById('cart-drawer-overlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function openWishlistDrawer() {
  const overlay = document.getElementById('wishlist-drawer-overlay');
  if (overlay) overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  renderWishlistUI();
}

function closeWishlistDrawer() {
  const overlay = document.getElementById('wishlist-drawer-overlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function toggleUserDropdown() {
  const menu = document.getElementById('userDropdownMenu');
  if (menu) menu.classList.toggle('show');
}

// Close dropdown when clicked outside
document.addEventListener('click', e => {
  const userWrap = document.querySelector('.user-menu-wrap');
  const menu = document.getElementById('userDropdownMenu');
  if (userWrap && menu && !userWrap.contains(e.target)) {
    menu.classList.remove('show');
  }
});

// ===== 14. CELEBRATORY CONFETTI ENGINE =====
function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = [];
  const colors = ['#d4a8ff', '#f9a8d4', '#7dd3fc', '#fcd34d', '#10b981', '#ffffff'];

  for (let i = 0; i < 120; i++) {
    pieces.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      w: Math.random() * 8 + 4,
      h: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.5) * 16 - 4,
      gravity: 0.25,
      rot: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 8,
      alpha: 1
    });
  }

  let animFrame;
  function updateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    pieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rot += p.rotSpeed;
      p.alpha -= 0.007;

      if (p.alpha > 0) {
        alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
    });

    if (alive) {
      animFrame = requestAnimationFrame(updateConfetti);
    } else {
      cancelAnimationFrame(animFrame);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  updateConfetti();
}

// ===== 15. FLIPKART MOBILE PHONE OTP AUTHENTICATION =====
async function checkAuthStatus() {
  try {
    const res = await fetch('api/auth.php?action=check');
    const data = await res.json();
    if (data.logged_in && data.user) {
      State.currentUser = data.user;
      localStorage.setItem('rishu_logged_in_user', JSON.stringify(data.user));
      renderLoggedInNav(data.user);
    } else {
      State.currentUser = null;
      localStorage.removeItem('rishu_logged_in_user');
      renderLoggedOutNav();
    }
  } catch (e) {
    const cached = JSON.parse(localStorage.getItem('rishu_logged_in_user') || 'null');
    if (cached && cached.name) {
      State.currentUser = cached;
      renderLoggedInNav(cached);
    } else {
      State.currentUser = null;
      renderLoggedOutNav();
    }
  }
}

function renderLoggedInNav(user) {
  const loginBtn = document.getElementById('navLoginBtn');
  const userMenu = document.getElementById('navUserMenu');
  const avatarEl = document.getElementById('navUserAvatar');
  const nameEl = document.getElementById('navUserName');
  const dropName = document.getElementById('dropdownUserName');
  const dropContact = document.getElementById('dropdownUserContact');

  if (loginBtn) loginBtn.style.display = 'none';
  if (userMenu) userMenu.style.display = 'flex';

  const initials = (user.name || 'User').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  if (avatarEl) avatarEl.textContent = initials || 'U';
  if (nameEl) nameEl.textContent = (user.name || 'User').split(' ')[0];
  if (dropName) dropName.textContent = user.name || 'Customer';
  if (dropContact) dropContact.textContent = user.phone ? '+91 ' + user.phone : (user.email || 'Verified User');

  if (State.userAddress) {
    State.userAddress.fullName = user.name || '';
    if (user.phone) State.userAddress.phone = user.phone;
    saveAddress();
  }

  // Update mobile overlay menu
  const mobLogin = document.getElementById('mobileLoginBtn');
  const mobLogout = document.getElementById('mobileLogoutBtn');
  const mobName = document.getElementById('mobileUserName');
  if (mobLogin) mobLogin.style.display = 'none';
  if (mobLogout) mobLogout.style.display = 'block';
  if (mobName) mobName.textContent = (user.name || 'User').split(' ')[0];
}

function renderLoggedOutNav() {
  const loginBtn = document.getElementById('navLoginBtn');
  const userMenu = document.getElementById('navUserMenu');
  if (loginBtn) loginBtn.style.display = 'inline-flex';
  if (userMenu) userMenu.style.display = 'none';

  if (State.userAddress) {
    State.userAddress.fullName = '';
    State.userAddress.phone = '';
    saveAddress();
  }

  // Update mobile overlay menu
  const mobLogin = document.getElementById('mobileLoginBtn');
  const mobLogout = document.getElementById('mobileLogoutBtn');
  if (mobLogin) mobLogin.style.display = 'block';
  if (mobLogout) mobLogout.style.display = 'none';
}

function openLoginModal(intent = '') {
  State.loginIntent = intent;
  const modal = document.getElementById('fk-login-modal');
  if (!modal) return;

  hideModalAlert();
  const vPhone = document.getElementById('fkViewPhone');
  const vOtp = document.getElementById('fkViewOtp');
  const vName = document.getElementById('fkViewName');

  if (vPhone) vPhone.style.display = 'block';
  if (vOtp) vOtp.style.display = 'none';
  if (vName) vName.style.display = 'none';

  const phoneInput = document.getElementById('fkInputPhone');
  if (phoneInput) {
    phoneInput.value = '';
    setTimeout(() => phoneInput.focus(), 150);
  }

  for (let i = 1; i <= 6; i++) {
    const d = document.getElementById('mOtp' + i);
    if (d) d.value = '';
  }

  const title = document.getElementById('fkModalTitle');
  const sub = document.getElementById('fkModalSubtitle');
  if (title) title.textContent = "Login";
  if (sub) sub.textContent = "Get access to your Orders, Wishlist and Recommendations";

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLoginModal() {
  const modal = document.getElementById('fk-login-modal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

function showModalAlert(msg, isSuccess = false) {
  const alertEl = document.getElementById('fkModalAlert');
  if (!alertEl) return;
  alertEl.className = 'fk-alert ' + (isSuccess ? 'fk-alert-success' : 'fk-alert-error');
  alertEl.innerHTML = `<i class="fa-solid ${isSuccess ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i> <span>${msg}</span>`;
  alertEl.style.display = 'flex';
}

function hideModalAlert() {
  const alertEl = document.getElementById('fkModalAlert');
  if (alertEl) alertEl.style.display = 'none';
}

function backToPhoneView() {
  hideModalAlert();
  document.getElementById('fkViewPhone').style.display = 'block';
  document.getElementById('fkViewOtp').style.display = 'none';
  document.getElementById('fkViewName').style.display = 'none';
  document.getElementById('fkInputPhone').focus();
}

let otpTimerInterval = null;
function startModalOtpTimer() {
  if (otpTimerInterval) clearInterval(otpTimerInterval);
  let sec = 30;
  const timerText = document.getElementById('fkTimerText');
  const timerSec = document.getElementById('fkTimerSec');
  const resendBtn = document.getElementById('fkBtnResend');

  if (timerText) timerText.style.display = 'inline';
  if (resendBtn) resendBtn.style.display = 'none';

  otpTimerInterval = setInterval(() => {
    sec--;
    if (sec <= 0) {
      clearInterval(otpTimerInterval);
      if (timerText) timerText.style.display = 'none';
      if (resendBtn) resendBtn.style.display = 'inline';
    } else {
      if (timerSec) timerSec.textContent = `00:${sec.toString().padStart(2, '0')}`;
    }
  }, 1000);
}

// 1. Send OTP to Mobile
async function sendMobileOtp() {
  hideModalAlert();
  const phoneInput = document.getElementById('fkInputPhone');
  const phone = (phoneInput?.value || '').trim();

  if (phone.length < 10) {
    showModalAlert('Please enter a valid 10-digit mobile number');
    phoneInput?.focus();
    return;
  }

  const btn = document.getElementById('fkBtnSendOtp');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Requesting OTP...`;
  }

  let data = null;
  try {
    const formData = new FormData();
    formData.append('phone', phone);

    const res = await fetch('api/auth.php?action=send_otp', {
      method: 'POST',
      body: formData
    });
    if (res.ok) {
      data = await res.json();
    }
  } catch (err) {
    // API not reachable or static hosting (GitHub Pages)
    data = null;
  }

  // Client-side fallback for static hosting / GitHub Pages
  if (!data || !data.success) {
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    State.serverGeneratedOtp = generatedOtp;
    State.otpTargetPhone = phone;

    const savedUsers = JSON.parse(localStorage.getItem('rishu_registered_users') || '{}');
    const existing = savedUsers[phone];
    State.isNewUser = !existing;

    data = {
      success: true,
      phone: phone,
      otp: generatedOtp,
      is_new_user: State.isNewUser
    };
  }

  if (data && data.success) {
    State.otpTargetPhone = data.phone;
    State.isNewUser = data.is_new_user;
    if (data.otp) State.serverGeneratedOtp = data.otp.toString();

    document.getElementById('fkTargetPhone').textContent = `+91 ${data.phone}`;
    document.getElementById('fkViewPhone').style.display = 'none';
    document.getElementById('fkViewOtp').style.display = 'block';

    // REALISTIC MOBILE PHONE SMS PUSH NOTIFICATION
    const smsBanner = document.getElementById('sms-push-banner');
    const smsOtpCode = document.getElementById('smsOtpCode');
    if (smsBanner && smsOtpCode) {
      smsOtpCode.textContent = data.otp;
      smsBanner.classList.add('show');
      setTimeout(() => smsBanner.classList.remove('show'), 9000);
    }

    startModalOtpTimer();
    setupModalOtpInputs();
  } else {
    showModalAlert(data?.message || 'Failed to send OTP. Please try again.');
  }

  if (btn) {
    btn.disabled = false;
    btn.textContent = 'Request OTP';
  }
}

function setupModalOtpInputs() {
  const inputs = [1,2,3,4,5,6].map(i => document.getElementById('mOtp' + i));
  inputs.forEach((input, index) => {
    if (!input) return;
    input.value = '';
    input.classList.remove('filled');

    // Handle single digit typing & auto advance
    input.oninput = (e) => {
      const val = e.target.value.replace(/[^0-9]/g, '');
      e.target.value = val ? val[val.length - 1] : '';
      if (e.target.value) {
        input.classList.add('filled');
        if (index < 5 && inputs[index + 1]) {
          inputs[index + 1].focus();
        }
      } else {
        input.classList.remove('filled');
      }

      const allDigits = inputs.map(inp => inp?.value || '').join('');
      if (allDigits.length === 6) {
        verifyMobileOtp();
      }
    };

    // Handle backspace and left/right arrows
    input.onkeydown = (e) => {
      if (e.key === 'Backspace') {
        if (!e.target.value && index > 0 && inputs[index - 1]) {
          inputs[index - 1].focus();
          inputs[index - 1].value = '';
          inputs[index - 1].classList.remove('filled');
        } else {
          e.target.value = '';
          input.classList.remove('filled');
        }
      } else if (e.key === 'ArrowLeft' && index > 0) {
        inputs[index - 1]?.focus();
      } else if (e.key === 'ArrowRight' && index < 5) {
        inputs[index + 1]?.focus();
      }
    };

    // Handle copy-paste of 6-digit OTP
    input.onpaste = (e) => {
      e.preventDefault();
      const pasteData = (e.clipboardData || window.clipboardData).getData('text').trim();
      const cleanDigits = pasteData.replace(/[^0-9]/g, '').slice(0, 6);
      if (cleanDigits) {
        cleanDigits.split('').forEach((digit, i) => {
          if (inputs[i]) {
            inputs[i].value = digit;
            inputs[i].classList.add('filled');
          }
        });
        const focusIdx = Math.min(cleanDigits.length, 5);
        inputs[focusIdx]?.focus();
        if (cleanDigits.length === 6) {
          verifyMobileOtp();
        }
      }
    };
  });

  setTimeout(() => {
    if (inputs[0]) inputs[0].focus();
  }, 100);
}

// 2. Verify OTP
async function verifyMobileOtp() {
  hideModalAlert();
  const digits = [1,2,3,4,5,6].map(i => document.getElementById('mOtp' + i)?.value || '').join('');

  if (digits.length < 6) {
    showModalAlert('Please enter the complete 6-digit OTP');
    return;
  }

  const btn = document.getElementById('fkBtnVerifyOtp');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Verifying...`;
  }

  let data = null;
  try {
    const formData = new FormData();
    formData.append('phone', State.otpTargetPhone);
    formData.append('otp', digits);

    const res = await fetch('api/auth.php?action=verify_otp', {
      method: 'POST',
      body: formData
    });
    if (res.ok) {
      data = await res.json();
    }
  } catch (err) {
    data = null;
  }

  // Fallback verification for static hosting (GitHub Pages)
  if (!data || !data.success) {
    if (!State.serverGeneratedOtp || digits === State.serverGeneratedOtp) {
      const savedUsers = JSON.parse(localStorage.getItem('rishu_registered_users') || '{}');
      const existing = savedUsers[State.otpTargetPhone];
      const defaultName = (State.otpTargetPhone === '9876543210' || State.otpTargetPhone === '9123456789') ? 'Rishabh Yadav' : '';
      const user = existing || {
        id: Date.now(),
        name: defaultName,
        phone: State.otpTargetPhone,
        role: 'customer',
        avatar: 'assets/male.png'
      };

      data = {
        success: true,
        user: user
      };
    }
  }

  if (data && data.success) {
    if (State.isNewUser && (!data.user.name || data.user.name.startsWith('Customer ') || data.user.name === '')) {
      document.getElementById('fkViewOtp').style.display = 'none';
      document.getElementById('fkViewName').style.display = 'block';
      document.getElementById('fkModalTitle').textContent = "Sign Up";
      document.getElementById('fkModalSubtitle').textContent = "Enter your name to complete registration";
      document.getElementById('fkInputName').focus();
      State.currentUser = data.user;
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<span>Verify & Continue</span> <i class="fa-solid fa-shield-check"></i>`;
      }
      return;
    }

    // Success Login
    State.currentUser = data.user;
    localStorage.setItem('rishu_logged_in_user', JSON.stringify(data.user));
    renderLoggedInNav(data.user);
    closeLoginModal();
    showToast(`Welcome, <strong>${data.user.name || 'Shopper'}</strong>! You are now logged in 🎉`, 'fa-circle-check');

    if (State.loginIntent === 'checkout') {
      openCheckoutModal();
    } else if (State.loginIntent === 'orders') {
      openOrdersDrawer();
    } else if (State.loginIntent === 'club') {
      openRishuClubModal();
    }
    syncBackendOrders();
  } else {
    showModalAlert('Invalid OTP. Please check the code shown in the notification banner.');
  }

  if (btn) {
    btn.disabled = false;
    btn.innerHTML = `<span>Verify & Continue</span> <i class="fa-solid fa-shield-check"></i>`;
  }
}

// 3. Complete New User Registration
async function completeNewUserRegistration() {
  const nameInput = document.getElementById('fkInputName');
  const fullName = (nameInput?.value || '').trim();

  if (!fullName) {
    showModalAlert('Please enter your full name');
    nameInput?.focus();
    return;
  }

  const btn = document.getElementById('fkBtnSaveName');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Saving...`;
  }

  let data = null;
  try {
    const formData = new FormData();
    formData.append('name', fullName);

    const res = await fetch('api/auth.php?action=register_name', {
      method: 'POST',
      body: formData
    });
    if (res.ok) {
      data = await res.json();
    }
  } catch (err) {
    data = null;
  }

  if (!data || !data.success) {
    const user = State.currentUser || {};
    user.name = fullName;
    user.phone = State.otpTargetPhone || '9876543210';
    user.role = 'customer';
    user.avatar = 'assets/male.png';

    // Save to registered users cache
    const savedUsers = JSON.parse(localStorage.getItem('rishu_registered_users') || '{}');
    if (user.phone) {
      savedUsers[user.phone] = user;
      localStorage.setItem('rishu_registered_users', JSON.stringify(savedUsers));
    }

    data = { success: true, user: user };
  }

  if (data.success) {
    State.currentUser = data.user;
    localStorage.setItem('rishu_logged_in_user', JSON.stringify(data.user));
    renderLoggedInNav(data.user);
    closeLoginModal();
    showToast(`Account created! Welcome to Rishu Shop, <strong>${data.user.name}</strong> 🛍️`, 'fa-circle-check');

    if (State.loginIntent === 'checkout') {
      openCheckoutModal();
    } else if (State.loginIntent === 'orders') {
      openOrdersDrawer();
    } else if (State.loginIntent === 'club') {
      openRishuClubModal();
    }
  }

  if (btn) {
    btn.disabled = false;
    btn.innerHTML = `<span>Start Shopping</span> <i class="fa-solid fa-arrow-right"></i>`;
  }
}

// 4. Logout
async function handleUserLogout() {
  try {
    await fetch('api/auth.php?action=logout');
  } catch (e) {}

  State.currentUser = null;
  localStorage.removeItem('rishu_logged_in_user');
  renderLoggedOutNav();
  showToast('You have been logged out successfully', 'fa-power-off');

  closeCartDrawer();
  closeOrdersDrawer();
  closeWishlistDrawer();
}

// ===== 16. RISHU VIP CLUB HANDLERS =====
function openRishuClubModal() {
  const modal = document.getElementById('rishu-club-modal');
  if (!modal) return;

  const memberNameEl = document.getElementById('clubMemberName');
  const actionBox = document.getElementById('clubActionBox');

  if (State.currentUser && State.currentUser.name) {
    if (memberNameEl) memberNameEl.textContent = State.currentUser.name.toUpperCase();
    if (actionBox) {
      actionBox.innerHTML = `
        <button type="button" class="btn-club-primary" onclick="copyAndApplyClubCoupon('WELCOME500')">
          <i class="fa-solid fa-gift"></i> Apply ₹500 Member Discount to Bag
        </button>
        <button type="button" class="btn-club-secondary" onclick="closeRishuClubModal()">
          <i class="fa-solid fa-bag-shopping"></i> Continue Shopping
        </button>
      `;
    }
  } else {
    if (memberNameEl) memberNameEl.textContent = 'VIP GUEST MEMBER';
    if (actionBox) {
      actionBox.innerHTML = `
        <button type="button" class="btn-club-primary" onclick="claimClubBenefits()">
          <i class="fa-solid fa-crown"></i> Join Free With Phone OTP
        </button>
        <button type="button" class="btn-club-secondary" onclick="copyAndApplyClubCoupon('WELCOME500')">
          <i class="fa-solid fa-ticket"></i> Try Coupon WELCOME500
        </button>
      `;
    }
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeRishuClubModal() {
  const modal = document.getElementById('rishu-club-modal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

function claimClubBenefits() {
  closeRishuClubModal();
  if (!State.currentUser) {
    openLoginModal('club');
    showToast('Enter your mobile number to activate your VIP Club perks!', 'fa-crown');
  } else {
    copyAndApplyClubCoupon('WELCOME500');
  }
}

function copyAndApplyClubCoupon(code) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(code).catch(() => {});
  }
  applyPromoCode(code);
  closeRishuClubModal();
  openCartDrawer();
  showToast(`🎉 <strong>${code}</strong> applied! ₹500 VIP discount activated!`, 'fa-circle-check');
}

// ===== INITIALIZATION ON DOM LOAD =====
document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();
  updateCartBadges();
  updateWishlistCardButtons();
  initSearchAndFilter();
  syncBackendOrders();
});
