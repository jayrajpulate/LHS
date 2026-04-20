/**
 * LHS — Shared API Client
 * A lightweight fetch wrapper with:
 *  - Auto base URL
 *  - JWT Bearer token injection
 *  - 401 → redirect to login
 *  - Unified error handling
 *  - Toast notifications
 */

const API_BASE = 'http://localhost:8000/api';
const STATIC_BASE = 'http://localhost:8000';
const TOKEN_KEY = 'lhs_admin_token';
const USER_KEY  = 'lhs_admin_user';

// ── Token Helpers ──────────────────────────────────────────────────
const Auth = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (t) => localStorage.setItem(TOKEN_KEY, t),
  getUser:  () => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); }
    catch { return null; }
  },
  setUser:  (u) => localStorage.setItem(USER_KEY, JSON.stringify(u)),
  clear:    () => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); },
  isLoggedIn: () => !!localStorage.getItem(TOKEN_KEY),
  redirectToLogin: () => {
    const depth = window.location.pathname.includes('/admin/') ? '../' : '';
    window.location.href = `${depth}admin/login.html`;
  },
};

// ── Toast Notification ─────────────────────────────────────────────
function showToast(message, type = 'info', duration = 3500) {
  const containerId = document.querySelector('#admin-toast-container')
    ? 'admin-toast-container'
    : 'toast-container';

  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    document.body.appendChild(container);
  }

  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `lhs-toast admin-toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(30px)';
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    setTimeout(() => toast.remove(), 320);
  }, duration);
}

// ── Core Fetch Wrapper ─────────────────────────────────────────────
async function apiRequest(endpoint, options = {}) {
  const token = Auth.getToken();
  const headers = {
    ...(options.headers || {}),
  };

  // Only add Content-Type for JSON bodies (not FormData)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = { ...options, headers };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);

    if (response.status === 401) {
      Auth.clear();
      if (window.location.pathname.includes('/admin/')) {
        Auth.redirectToLogin();
      }
      throw new Error('Unauthorized. Please log in again.');
    }

    if (!response.ok) {
      let errMsg = `Error ${response.status}`;
      try {
        const err = await response.json();
        errMsg = err.detail || errMsg;
      } catch {}
      throw new Error(errMsg);
    }

    // 204 No Content
    if (response.status === 204) return null;

    return await response.json();
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Cannot connect to the server. Make sure the backend is running.');
    }
    throw err;
  }
}

// ── Convenience Methods ────────────────────────────────────────────
const api = {
  get:    (url, opts = {})    => apiRequest(url, { method: 'GET', ...opts }),
  post:   (url, body, opts={})=> apiRequest(url, { method: 'POST',   body: JSON.stringify(body), ...opts }),
  put:    (url, body, opts={})=> apiRequest(url, { method: 'PUT',    body: JSON.stringify(body), ...opts }),
  patch:  (url, body, opts={})=> apiRequest(url, { method: 'PATCH',  body: JSON.stringify(body), ...opts }),
  delete: (url, opts = {})    => apiRequest(url, { method: 'DELETE', ...opts }),
  postForm: (url, formData, opts = {}) =>
    apiRequest(url, { method: 'POST', body: formData, ...opts }),
  putForm: (url, formData, opts = {}) =>
    apiRequest(url, { method: 'PUT',  body: formData, ...opts }),
};

// ── Image URL Helper ───────────────────────────────────────────────
function getLawyerImageUrl(profilePic) {
  if (!profilePic) return null;
  return `${STATIC_BASE}/static/uploads/${profilePic}`;
}

// ── Placeholder Initials Avatar ─────────────────────────────────────
function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

// ── Debounce ───────────────────────────────────────────────────────
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ── Format Date ────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

// ── Confirm Modal (replaces native confirm) ──────────────────────────
function confirmAction(message) {
  return new Promise(resolve => {
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div style="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9998;display:flex;align-items:center;justify-content:center;">
        <div style="background:#fff;border-radius:12px;padding:32px;max-width:380px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.2);text-align:center;">
          <div style="font-size:2.5rem;margin-bottom:12px;">⚠️</div>
          <p style="font-size:0.95rem;color:#1e2d3d;margin-bottom:24px;">${message}</p>
          <div style="display:flex;gap:10px;justify-content:center;">
            <button id="confirm-no"  style="padding:10px 24px;border-radius:6px;border:1px solid #e2e8f0;background:#fff;cursor:pointer;font-weight:600;">Cancel</button>
            <button id="confirm-yes" style="padding:10px 24px;border-radius:6px;border:none;background:#ef4444;color:#fff;cursor:pointer;font-weight:600;">Delete</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelector('#confirm-yes').onclick = () => { document.body.removeChild(modal); resolve(true); };
    modal.querySelector('#confirm-no').onclick  = () => { document.body.removeChild(modal); resolve(false); };
  });
}

// ── Reveal Animations (Intersection Observer) ──────────────────────
function initRevealAnimations() {
  const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.12 });
  els.forEach(el => obs.observe(el));
}

// ── Count-Up Animation ─────────────────────────────────────────────
function animateCountUp(el, target, duration = 1800) {
  const start = performance.now();
  const update = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // cubic ease-out
    el.textContent = Math.floor(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

// ── Navbar Scroll Effect ─────────────────────────────────────────────
function initNavbarScroll() {
  const navbar = document.querySelector('.lhs-navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });
}

// ── Back to Top ──────────────────────────────────────────────────────
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('show', window.scrollY > 400));
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ── Page Loader ──────────────────────────────────────────────────────
function hideLoader() {
  const loader = document.getElementById('page-loader');
  if (loader) {
    loader.classList.add('hidden');
    setTimeout(() => loader.remove(), 500);
  }
}

// Export globals for use in page scripts
window.api = api;
window.Auth = Auth;
window.showToast = showToast;
window.getLawyerImageUrl = getLawyerImageUrl;
window.getInitials = getInitials;
window.debounce = debounce;
window.formatDate = formatDate;
window.confirmAction = confirmAction;
window.initRevealAnimations = initRevealAnimations;
window.animateCountUp = animateCountUp;
window.initNavbarScroll = initNavbarScroll;
window.initBackToTop = initBackToTop;
window.hideLoader = hideLoader;
window.STATIC_BASE = STATIC_BASE;
