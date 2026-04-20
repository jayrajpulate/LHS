/**
 * LHS Admin — Site Pages Manager
 * Manages About Us and Contact Page content
 */
document.addEventListener('DOMContentLoaded', () => {
  requireAuth();
  initSidebar();
  loadAllPages();
});

const PAGE_TYPES = ['aboutus', 'contact', 'terms', 'privacy'];

async function loadAllPages() {
  for (const type of PAGE_TYPES) {
    try {
      const data = await api.get(`/pages/${type}`);
      populateForm(type, data);
    } catch {
      // Page doesn't exist yet — form stays empty
    }
  }
}

function populateForm(type, data) {
  const el = (id) => document.getElementById(`${type}-${id}`);
  if (el('title'))  el('title').value  = data.PageTitle || '';
  if (el('desc'))   el('desc').value   = data.PageDescription || '';
  if (el('email'))  el('email').value  = data.Email || '';
  if (el('mobile')) el('mobile').value = data.MobileNumber || '';
}

async function savePage(type, e) {
  e.preventDefault();
  const btn = e.target.querySelector('[type="submit"]');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Saving...';

  const el = (id) => document.getElementById(`${type}-${id}`);
  const payload = {
    PageTitle:       el('title')?.value  || '',
    PageDescription: el('desc')?.value   || '',
    Email:           el('email')?.value  || null,
    MobileNumber:    el('mobile')?.value ? parseInt(el('mobile').value) : null,
  };

  try {
    await api.put(`/pages/${type}`, payload);
    showToast('Page saved successfully!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="bi bi-floppy me-2"></i> Save Changes';
  }
}

window.savePage = savePage;
