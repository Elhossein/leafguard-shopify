/* ===================================
   AIRGUARD TAPE™ — SHOPIFY THEME JS
   =================================== */

document.addEventListener('DOMContentLoaded', function () {

  // ===== STICKY ATC BAR =====
  const stickyAtc = document.getElementById('sticky-atc');
  const heroSection = document.querySelector('.product-hero');
  if (stickyAtc && heroSection) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          stickyAtc.classList.remove('hidden');
          stickyAtc.classList.add('visible');
        } else {
          stickyAtc.classList.remove('visible');
          stickyAtc.classList.add('hidden');
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(heroSection);
  }

  // ===== QUANTITY SELECTOR =====
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const input = this.closest('.qty-selector').querySelector('.qty-input');
      let val = parseInt(input.value, 10) || 1;
      if (this.dataset.action === 'minus') val = Math.max(1, val - 1);
      if (this.dataset.action === 'plus') val = Math.min(99, val + 1);
      input.value = val;
    });
  });

  // ===== PRODUCT IMAGE THUMBNAILS =====
  const thumbs = document.querySelectorAll('.thumb-img');
  const mainImg = document.querySelector('.product-hero__main-img img');
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', function () {
      thumbs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      const newSrc = this.querySelector('img').src;
      if (mainImg) {
        mainImg.style.opacity = '0';
        setTimeout(() => {
          mainImg.src = newSrc;
          mainImg.style.opacity = '1';
        }, 150);
        mainImg.style.transition = 'opacity 0.15s ease';
      }
    });
  });

  // ===== PACK OPTIONS =====
  document.querySelectorAll('.pack-option').forEach(opt => {
    opt.addEventListener('click', function () {
      document.querySelectorAll('.pack-option').forEach(o => o.classList.remove('active'));
      this.classList.add('active');
      // Update price display
      const price = this.dataset.price;
      const comparePrice = this.dataset.comparePrice;
      if (price) {
        const salePrices = document.querySelectorAll('.product-hero__price-sale');
        salePrices.forEach(el => el.textContent = '$' + price);
      }
      if (comparePrice) {
        const comparePrices = document.querySelectorAll('.product-hero__price-compare');
        comparePrices.forEach(el => el.textContent = '$' + comparePrice);
      }
    });
  });

  // ===== ADD TO CART =====
  const addToCartBtns = document.querySelectorAll('[data-add-to-cart]');
  addToCartBtns.forEach(btn => {
    btn.addEventListener('click', async function (e) {
      e.preventDefault();
      const variantId = this.dataset.variantId || this.closest('[data-variant-id]')?.dataset.variantId;
      const qtyInput = document.querySelector('.qty-input');
      const qty = qtyInput ? parseInt(qtyInput.value, 10) : 1;

      if (!variantId) {
        showToast('⚠️ Please select a variant');
        return;
      }

      const originalText = this.innerHTML;
      this.innerHTML = '<span>Adding...</span>';
      this.disabled = true;

      try {
        const res = await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ id: variantId, quantity: qty }),
        });
        if (res.ok) {
          const data = await res.json();
          showToast('✅ Added to cart!');
          updateCartCount();
          openCartDrawer();
          refreshCartDrawer();
        } else {
          throw new Error('Add to cart failed');
        }
      } catch (err) {
        showToast('❌ Something went wrong. Try again.');
      } finally {
        this.innerHTML = originalText;
        this.disabled = false;
      }
    });
  });

  // ===== CART DRAWER =====
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-drawer-overlay');
  const cartCloseBtn = document.getElementById('cart-close-btn');
  const cartBtn = document.getElementById('cart-btn');

  function openCartDrawer() {
    if (cartDrawer) {
      cartDrawer.classList.remove('hidden');
      cartDrawer.classList.add('open');
    }
    if (cartOverlay) {
      cartOverlay.classList.remove('hidden');
    }
    document.body.style.overflow = 'hidden';
  }

  function closeCartDrawer() {
    if (cartDrawer) {
      cartDrawer.classList.remove('open');
      setTimeout(() => cartDrawer.classList.add('hidden'), 350);
    }
    if (cartOverlay) {
      cartOverlay.classList.add('hidden');
    }
    document.body.style.overflow = '';
  }

  if (cartBtn) cartBtn.addEventListener('click', openCartDrawer);
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCartDrawer);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCartDrawer);

  async function refreshCartDrawer() {
    const body = document.getElementById('cart-drawer-body');
    if (!body) return;
    try {
      const res = await fetch('/cart.js');
      const cart = await res.json();
      if (cart.item_count === 0) {
        body.innerHTML = '<p class="cart-empty-msg">Your cart is empty.</p>';
      } else {
        body.innerHTML = cart.items.map(item => `
          <div class="cart-item">
            <img class="cart-item__image" src="${item.image}" alt="${item.product_title}">
            <div class="cart-item__details">
              <div class="cart-item__name">${item.product_title}</div>
              <div class="cart-item__qty">Qty: ${item.quantity}</div>
              <div class="cart-item__price">$${(item.final_line_price / 100).toFixed(2)}</div>
            </div>
          </div>
        `).join('');
      }
    } catch (err) {
      console.error('Cart refresh failed', err);
    }
  }

  async function updateCartCount() {
    try {
      const res = await fetch('/cart.js');
      const cart = await res.json();
      const countEl = document.querySelector('.cart-count');
      if (countEl) {
        countEl.textContent = cart.item_count;
        countEl.style.display = cart.item_count > 0 ? 'flex' : 'none';
      }
    } catch (err) {}
  }
  updateCartCount();

  // ===== FAQ ACCORDION =====
  document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', function () {
      const item = this.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      // Toggle clicked
      if (!isOpen) item.classList.add('open');
    });
  });

  // ===== COUNTDOWN TIMER =====
  function initCountdown() {
    const hours = document.getElementById('countdown-hours');
    const mins = document.getElementById('countdown-minutes');
    const secs = document.getElementById('countdown-seconds');
    if (!hours || !mins || !secs) return;

    let total = 4 * 3600 + 37 * 60 + 22; // ~4h 37m starting

    function update() {
      if (total <= 0) { total = 8 * 3600; }
      const h = Math.floor(total / 3600);
      const m = Math.floor((total % 3600) / 60);
      const s = total % 60;
      hours.textContent = String(h).padStart(2, '0');
      mins.textContent = String(m).padStart(2, '0');
      secs.textContent = String(s).padStart(2, '0');
      total--;
    }
    update();
    setInterval(update, 1000);
  }
  initCountdown();

  // ===== SCROLL ANIMATIONS =====
  const animatables = document.querySelectorAll('[data-animate]');
  if (animatables.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    animatables.forEach(el => io.observe(el));
  }

  // ===== TOAST NOTIFICATION =====
  function showToast(msg) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 3000);
  }
  window.showToast = showToast;

  // ===== LAZY IMAGES =====
  if ('IntersectionObserver' in window) {
    const lazyImgs = document.querySelectorAll('img[loading="lazy"]');
    const imgObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { imgObserver.unobserve(e.target); }
      });
    });
    lazyImgs.forEach(img => imgObserver.observe(img));
  }

});
