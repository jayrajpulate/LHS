/**
 * LHS Admin — Authentication
 * Shared auth guard + login/logout logic
 */

// ── Auth Guard: call on all protected admin pages ────────────────────
function requireAuth() {
  if (!Auth.isLoggedIn()) {
    Auth.redirectToLogin();
  }
  loadCurrentUser();
}

// ── Load and display current user in sidebar ──────────────────────────
async function loadCurrentUser() {
  const storedUser = Auth.getUser();
  if (storedUser) {
    updateUserUI(storedUser);
    return;
  }
  try {
    const user = await api.get('/auth/me');
    Auth.setUser(user);
    updateUserUI(user);
  } catch { Auth.clear(); Auth.redirectToLogin(); }
}

function updateUserUI(user) {
  const nameEl  = document.getElementById('sidebar-user-name');
  const roleEl  = document.getElementById('sidebar-user-role');
  const initEl  = document.getElementById('sidebar-user-initials');
  if (nameEl)  nameEl.textContent  = user.AdminName || user.AdminuserName;
  if (roleEl)  roleEl.textContent  = user.UserType === 1 ? 'Super Admin' : 'Admin';
  if (initEl)  initEl.textContent  = getInitials(user.AdminName || user.AdminuserName);
}

// ── Logout ─────────────────────────────────────────────────────────────
function logout() {
  Auth.clear();
  showToast('Logged out successfully', 'success', 1500);
  setTimeout(() => Auth.redirectToLogin(), 1500);
}

// ── Login Form (only on login.html) ────────────────────────────────────
function initLoginPage() {
  if (Auth.isLoggedIn()) {
    window.location.href = 'dashboard.html';
    return;
  }

  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errEl = document.getElementById('login-error');

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Logging in...';
    if (errEl) errEl.textContent = '';

    try {
      const body = new URLSearchParams({ username, password });
      const tokenData = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });

      if (!tokenData.ok) {
        const err = await tokenData.json();
        throw new Error(err.detail || 'Login failed');
      }

      const token = await tokenData.json();
      Auth.setToken(token.access_token);

      // Fetch user info
      const user = await api.get('/auth/me');
      Auth.setUser(user);

      showToast(`Welcome back, ${user.AdminName}!`, 'success');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
    } catch (err) {
      if (errEl) errEl.textContent = err.message;
      btn.disabled = false;
      btn.innerHTML = 'Sign In';

      // Shake animation
      form.classList.add('shake');
      setTimeout(() => form.classList.remove('shake'), 600);
    }
  });

  // Password visibility toggle
  const togglePwd = document.getElementById('toggle-password');
  const pwdInput  = document.getElementById('password');
  if (togglePwd && pwdInput) {
    togglePwd.addEventListener('click', () => {
      const isText = pwdInput.type === 'text';
      pwdInput.type = isText ? 'password' : 'text';
      togglePwd.querySelector('i').className = `bi bi-eye${isText ? '' : '-slash'}`;
    });
  }
}

// ── Sidebar Toggle ─────────────────────────────────────────────────────
function initSidebar() {
  const sidebar  = document.getElementById('admin-sidebar');
  const overlay  = document.getElementById('admin-overlay');
  const toggleBtn = document.getElementById('toggle-sidebar');
  if (!sidebar) return;

  toggleBtn?.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay?.classList.toggle('show');
  });
  overlay?.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
  });

  // Mark active nav link
  const path = window.location.pathname;
  document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
    if (link.getAttribute('href') && path.endsWith(link.getAttribute('href').split('/').pop())) {
      link.classList.add('active');
    }
  });
}

// Expose
window.requireAuth = requireAuth;
window.logout = logout;
window.initLoginPage = initLoginPage;
window.initSidebar = initSidebar;
