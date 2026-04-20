/**
 * LHS Admin — Lawyers Management
 * Handles: list, search, add, edit (modal), delete, toggle public
 */

let lawyersPage = 1;
const LP_PER_PAGE = 15;
let lawyerSearch   = '';
let lawyerPublicFilter = '';
let editingId = null;

document.addEventListener('DOMContentLoaded', () => {
  requireAuth();
  initSidebar();
  fetchAdminLawyers();
  bindEvents();
});

function bindEvents() {
  const searchInput = document.getElementById('lawyer-search');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(() => {
      lawyerSearch = searchInput.value;
      lawyersPage = 1;
      fetchAdminLawyers();
    }, 350));
  }

  const pubFilter = document.getElementById('filter-public');
  if (pubFilter) {
    pubFilter.addEventListener('change', () => {
      lawyerPublicFilter = pubFilter.value;
      lawyersPage = 1;
      fetchAdminLawyers();
    });
  }

  // Reset modal on close
  const modal = document.getElementById('lawyer-modal');
  if (modal) {
    modal.addEventListener('hidden.bs.modal', resetForm);
  }

  // Image preview
  const picInput = document.getElementById('field-profile-pic');
  if (picInput) {
    picInput.addEventListener('change', handleImagePreview);
  }

  // Drag & drop on upload area
  const uploadArea = document.getElementById('upload-area');
  if (uploadArea && picInput) {
    uploadArea.addEventListener('click', () => picInput.click());
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('dragover'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      if (e.dataTransfer.files[0]) {
        picInput.files = e.dataTransfer.files;
        handleImagePreview({ target: picInput });
      }
    });
  }

  // Form submit
  const form = document.getElementById('lawyer-form');
  if (form) form.addEventListener('submit', submitLawyerForm);
}

// ── Fetch Lawyers ────────────────────────────────────────────────────────
async function fetchAdminLawyers() {
  const tbody = document.getElementById('lawyers-tbody');
  const countEl = document.getElementById('lawyer-count');
  tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4"><div class="loader-ring mx-auto"></div></td></tr>`;

  const params = new URLSearchParams({ page: lawyersPage, per_page: LP_PER_PAGE });
  if (lawyerSearch) params.set('name', lawyerSearch);
  if (lawyerPublicFilter !== '') params.set('is_public', lawyerPublicFilter);

  try {
    const data = await api.get(`/lawyers/admin/all?${params}`);
    const { lawyers, total } = data;

    if (countEl) countEl.textContent = total;
    if (!lawyers.length) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-5">No lawyers found</td></tr>`;
    } else {
      tbody.innerHTML = lawyers.map((l, i) => lawyerRow(l, i)).join('');
    }

    renderPagination(total, lawyersPage, LP_PER_PAGE, 'lawyers-pagination', (p) => {
      lawyersPage = p;
      fetchAdminLawyers();
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4">${err.message}</td></tr>`;
    showToast(err.message, 'error');
  }
}

function lawyerRow(l, i) {
  const imgUrl = getLawyerImageUrl(l.ProfilePic);
  return `<tr class="animate-in" style="animation-delay:${i * 0.04}s">
    <td>
      <div class="d-flex align-items-center gap-3">
        ${imgUrl
          ? `<img src="${imgUrl}" class="table-avatar" alt="${l.LawyerName}">`
          : `<div class="table-avatar-placeholder">${getInitials(l.LawyerName)}</div>`}
        <div>
          <div class="fw-semibold">${l.LawyerName}</div>
          <div class="text-muted" style="font-size:0.78rem">${l.LawyerEmail || '—'}</div>
        </div>
      </div>
    </td>
    <td>${l.City || '—'}</td>
    <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${l.PracticeAreas || '—'}</td>
    <td>${l.LawyerExp ? l.LawyerExp + ' yrs' : '—'}</td>
    <td><span class="${l.IsPublic ? 'badge-public' : 'badge-private'}">${l.IsPublic ? 'Public' : 'Private'}</span></td>
    <td>${formatDate(l.RegDate)}</td>
    <td>
      <div class="d-flex gap-1">
        <button class="action-btn view"   onclick="openViewProfile(${l.id})" title="Public Profile"><i class="bi bi-eye"></i></button>
        <button class="action-btn edit"   onclick="openEditModal(${l.id})"   title="Edit"><i class="bi bi-pencil"></i></button>
        <button class="action-btn toggle" onclick="togglePublic(${l.id})"    title="Toggle Visibility"><i class="bi bi-toggle-on"></i></button>
        <button class="action-btn delete" onclick="deleteLawyer(${l.id})"    title="Delete"><i class="bi bi-trash"></i></button>
      </div>
    </td>
  </tr>`;
}

// ── Open Add Modal ─────────────────────────────────────────────────────
function openAddModal() {
  editingId = null;
  resetForm();
  document.getElementById('modal-title').textContent = 'Add New Lawyer';
  const modal = new bootstrap.Modal(document.getElementById('lawyer-modal'));
  modal.show();
}

// ── Open Edit Modal ────────────────────────────────────────────────────
async function openEditModal(id) {
  const data = await api.get(`/lawyers/admin/all?per_page=200`);
  const lawyer = (data.lawyers || []).find(l => l.id === id);
  if (!lawyer) { showToast('Lawyer not found', 'error'); return; }

  editingId = id;
  document.getElementById('modal-title').textContent = 'Edit Lawyer';

  const fields = {
    'field-name':     lawyer.LawyerName,
    'field-email':    lawyer.LawyerEmail,
    'field-mobile':   lawyer.LawyerMobileNo,
    'field-address':  lawyer.OfficeAddress,
    'field-city':     lawyer.City,
    'field-state':    lawyer.State,
    'field-langs':    lawyer.LanguagesKnown,
    'field-exp':      lawyer.LawyerExp,
    'field-areas':    lawyer.PracticeAreas,
    'field-courts':   lawyer.Courts,
    'field-website':  lawyer.Website,
    'field-desc':     lawyer.Description,
    'field-public':   lawyer.IsPublic,
  };
  Object.entries(fields).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el && val !== null && val !== undefined) el.value = val;
  });

  // Show existing pic
  if (lawyer.ProfilePic) {
    showPreviewImage(getLawyerImageUrl(lawyer.ProfilePic));
  }

  new bootstrap.Modal(document.getElementById('lawyer-modal')).show();
}

function openViewProfile(id) {
  window.open(`../../lawyer-detail.html?id=${id}`, '_blank');
}

// ── Submit Form ─────────────────────────────────────────────────────────
async function submitLawyerForm(e) {
  e.preventDefault();
  const btn = document.getElementById('modal-submit-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Saving...';

  const form = document.getElementById('lawyer-form');
  const formData = new FormData(form);

  try {
    if (editingId) {
      await api.putForm(`/lawyers/admin/${editingId}`, formData);
      showToast('Lawyer updated successfully!', 'success');
    } else {
      await api.postForm('/lawyers/admin', formData);
      showToast('Lawyer added successfully!', 'success');
    }
    bootstrap.Modal.getInstance(document.getElementById('lawyer-modal')).hide();
    fetchAdminLawyers();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Save Lawyer';
  }
}

// ── Toggle Public ─────────────────────────────────────────────────────────
async function togglePublic(id) {
  try {
    await api.patch(`/lawyers/admin/${id}/toggle-public`);
    showToast('Visibility updated!', 'success');
    fetchAdminLawyers();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ── Delete Lawyer ──────────────────────────────────────────────────────
async function deleteLawyer(id) {
  const ok = await confirmAction('Are you sure you want to permanently delete this lawyer? This cannot be undone.');
  if (!ok) return;
  try {
    await api.delete(`/lawyers/admin/${id}`);
    showToast('Lawyer deleted successfully.', 'success');
    fetchAdminLawyers();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ── Image Preview ─────────────────────────────────────────────────────────
function handleImagePreview(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => showPreviewImage(ev.target.result);
  reader.readAsDataURL(file);
}

function showPreviewImage(src) {
  const wrap = document.getElementById('preview-wrap');
  const uploadArea = document.getElementById('upload-area');
  if (!wrap) return;
  wrap.innerHTML = `
    <div class="img-preview-wrap">
      <img src="${src}" class="img-preview" id="preview-img" alt="Preview">
      <button class="img-preview-remove" type="button" onclick="removePreview()" title="Remove">×</button>
    </div>`;
  if (uploadArea) uploadArea.style.display = 'none';
}

function removePreview() {
  const wrap = document.getElementById('preview-wrap');
  const uploadArea = document.getElementById('upload-area');
  const picInput = document.getElementById('field-profile-pic');
  if (wrap) wrap.innerHTML = '';
  if (uploadArea) uploadArea.style.display = '';
  if (picInput) picInput.value = '';
}

// ── Reset Form ────────────────────────────────────────────────────────────
function resetForm() {
  const form = document.getElementById('lawyer-form');
  if (form) form.reset();
  removePreview();
  editingId = null;
}

// ── Shared Pagination Helper ──────────────────────────────────────────────
function renderPagination(total, page, pp, containerId, onPageClick) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const pages = Math.ceil(total / pp);
  if (pages <= 1) { el.innerHTML = ''; return; }
  let html = `<nav><ul class="pagination justify-content-center">`;
  html += `<li class="page-item ${page <= 1 ? 'disabled' : ''}">
    <button class="page-link" onclick="(${onPageClick.toString()})(${page - 1})"><i class="bi bi-chevron-left"></i></button></li>`;
  for (let p = 1; p <= pages; p++) {
    html += `<li class="page-item ${p === page ? 'active' : ''}">
      <button class="page-link" onclick="(${onPageClick.toString()})(${p})">${p}</button></li>`;
  }
  html += `<li class="page-item ${page >= pages ? 'disabled' : ''}">
    <button class="page-link" onclick="(${onPageClick.toString()})(${page + 1})"><i class="bi bi-chevron-right"></i></button></li>
  </ul></nav>`;
  el.innerHTML = html;
}

// Expose globals
window.openAddModal = openAddModal;
window.openEditModal = openEditModal;
window.openViewProfile = openViewProfile;
window.togglePublic = togglePublic;
window.deleteLawyer = deleteLawyer;
window.removePreview = removePreview;
