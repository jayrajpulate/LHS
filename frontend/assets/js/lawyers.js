/**
 * LHS — Lawyer Directory Page JavaScript
 * Handles: search, filter, paginated listing
 * NOTE: Navbar, back-to-top, loader, and reveals are handled by animations.js
 */

let currentPage = 1;
const perPage   = 12;
let totalPages  = 1;
let filters     = { name: '', city: '', state: '', practice_area: '' };
let loading     = false;

document.addEventListener('DOMContentLoaded', async () => {
  await loadPracticeAreaFilters();
  readUrlParams();
  await fetchLawyers();
  bindFilterEvents();
});

// ── Read query params on load ───────────────────────────────────────
function readUrlParams() {
  const params = new URLSearchParams(window.location.search);
  filters.name          = params.get('name')          || '';
  filters.city          = params.get('city')          || '';
  filters.practice_area = params.get('practice_area') || '';

  if (filters.name)          document.getElementById('filter-name').value = filters.name;
  if (filters.city)          document.getElementById('filter-city').value = filters.city;
  if (filters.practice_area) document.getElementById('filter-area').value = filters.practice_area;
}

// ── Bind filter events ────────────────────────────────────────────────
function bindFilterEvents() {
  const searchDebounced = debounce(() => { currentPage = 1; fetchLawyers(); }, 400);

  ['filter-name', 'filter-city'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => {
      filters[id.replace('filter-', '')] = el.value;
      searchDebounced();
    });
  });

  const areaSelect = document.getElementById('filter-area');
  if (areaSelect) areaSelect.addEventListener('change', () => {
    filters.practice_area = areaSelect.value;
    currentPage = 1;
    fetchLawyers();
  });

  const stateSelect = document.getElementById('filter-state');
  if (stateSelect) stateSelect.addEventListener('change', () => {
    filters.state = stateSelect.value;
    currentPage = 1;
    fetchLawyers();
  });

  const resetBtn = document.getElementById('filter-reset');
  if (resetBtn) resetBtn.addEventListener('click', () => {
    filters = { name: '', city: '', state: '', practice_area: '' };
    ['filter-name', 'filter-city'].forEach(id => { const e = document.getElementById(id); if (e) e.value = ''; });
    ['filter-area', 'filter-state'].forEach(id => { const e = document.getElementById(id); if (e) e.value = ''; });
    currentPage = 1;
    fetchLawyers();
  });
}

// ── Fetch Lawyers ──────────────────────────────────────────────────────
async function fetchLawyers() {
  if (loading) return;
  loading = true;
  const grid = document.getElementById('lawyers-grid');
  const countEl = document.getElementById('result-count');
  grid.innerHTML = `<div class="col-12 text-center py-5">
    <div class="loader-ring mx-auto" style="border-top-color:#333335;"></div>
    <p class="mt-3 text-muted">Searching lawyers...</p>
  </div>`;

  const params = new URLSearchParams({ page: currentPage, per_page: perPage });
  if (filters.name)          params.set('name', filters.name);
  if (filters.city)          params.set('city', filters.city);
  if (filters.state)         params.set('state', filters.state);
  if (filters.practice_area) params.set('practice_area', filters.practice_area);

  try {
    const data = await api.get(`/lawyers/?${params}`);
    const { lawyers, total, page, per_page: pp } = data;
    totalPages = Math.ceil(total / pp);

    if (countEl) countEl.textContent = `${total} lawyer${total !== 1 ? 's' : ''} found`;

    const state = Flip.getState(".lawyer-card-wrap");

    if (!lawyers.length) {
      grid.innerHTML = `<div class="col-12 text-center py-5">
        <div style="font-size:3rem;">⚖️</div>
        <h5 class="mt-3">No lawyers found</h5>
        <p class="text-muted">Try broadening your search criteria.</p>
      </div>`;
    } else {
      grid.innerHTML = lawyers.map((l, i) => createCard(l, i)).join('');
      
      Flip.from(state, {
        duration: 0.6,
        ease: "power2.inOut",
        stagger: 0.05,
        onEnter: elements => gsap.fromTo(elements, {opacity: 0, scale: 0.5}, {opacity: 1, scale: 1, duration: 0.6}),
        onLeave: elements => gsap.to(elements, {opacity: 0, scale: 0.5, duration: 0.6})
      });
    }

    renderPagination(total, page, pp);
    if (typeof initScrollReveals === 'function') initScrollReveals();
    if (typeof refreshScroll === 'function') setTimeout(refreshScroll, 200);
  } catch (err) {
    grid.innerHTML = `<div class="col-12 text-center py-5 text-danger"><p>${err.message}</p></div>`;
  } finally {
    loading = false;
  }
}

function createCard(lawyer, idx) {
  const imgUrl = getLawyerImageUrl(lawyer.ProfilePic);
  const areas = (lawyer.PracticeAreas || '').split(',').filter(Boolean).slice(0, 3);
  return `
    <div class="col-lg-3 col-md-6 mb-4 lawyer-card-wrap" data-flip-id="${lawyer.id}">
      <div class="lawyer-card" style="font-size:0.85rem;">
        <div class="card-img-wrapper">
          ${imgUrl
            ? `<img src="${imgUrl}" class="card-img-top" alt="${lawyer.LawyerName}" loading="lazy" style="height:180px;">`
            : `<div class="card-img-top d-flex align-items-center justify-content-center" style="height:180px;background:linear-gradient(135deg,#333335,#5a5a5c);color:#fff;font-size:2.5rem;font-weight:900">${getInitials(lawyer.LawyerName)}</div>`}
          <div class="card-overlay">
            <a href="lawyer-detail.html?id=${lawyer.id}" class="btn btn-sm btn-accent" style="font-size:0.75rem;padding:4px 10px;">View →</a>
          </div>
        </div>
        <div class="card-body" style="padding:15px;">
          <h5 class="card-title" style="font-size:0.95rem;">${lawyer.LawyerName}</h5>
          <div class="mb-2">${areas.map(a => `<span class="practice-badge" style="font-size:0.65rem;padding:2px 8px;">${a.trim()}</span>`).join('')}</div>
          <div class="card-meta" style="font-size:0.75rem;margin:5px 0 10px;">
            ${lawyer.City ? `<div><i class="bi bi-geo-alt-fill"></i> ${lawyer.City}${lawyer.State ? ', ' + lawyer.State : ''}</div>` : ''}
            ${lawyer.LawyerExp ? `<div><i class="bi bi-briefcase-fill"></i> ${lawyer.LawyerExp}+ yrs</div>` : ''}
          </div>
          <a href="lawyer-detail.html?id=${lawyer.id}" class="btn btn-primary-lhs btn-sm w-100 mt-1" style="font-size:0.75rem;padding:6px;">View Profile</a>
        </div>
      </div>
    </div>`;
}

// ── Pagination ──────────────────────────────────────────────────────────
function renderPagination(total, page, pp) {
  const pag = document.getElementById('pagination');
  if (!pag) return;
  const pages = Math.ceil(total / pp);
  if (pages <= 1) { pag.innerHTML = ''; return; }

  let html = `<nav><ul class="pagination justify-content-center flex-wrap">`;
  html += `<li class="page-item ${page <= 1 ? 'disabled' : ''}">
    <button class="page-link" onclick="goToPage(${page - 1})"><i class="bi bi-chevron-left"></i></button></li>`;

  for (let p = 1; p <= pages; p++) {
    if (pages > 7 && p > 2 && p < pages - 1 && Math.abs(p - page) > 1) {
      if (p === 3 || p === pages - 2) html += `<li class="page-item disabled"><span class="page-link">…</span></li>`;
      continue;
    }
    html += `<li class="page-item ${p === page ? 'active' : ''}">
      <button class="page-link" onclick="goToPage(${p})">${p}</button></li>`;
  }

  html += `<li class="page-item ${page >= pages ? 'disabled' : ''}">
    <button class="page-link" onclick="goToPage(${page + 1})"><i class="bi bi-chevron-right"></i></button></li>`;
  html += `</ul></nav>`;
  pag.innerHTML = html;
}

function goToPage(page) {
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  fetchLawyers();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Practice Area Filter Dropdown ─────────────────────────────────────
async function loadPracticeAreaFilters() {
  const select = document.getElementById('filter-area');
  if (!select) return;
  try {
    const areas = await api.get('/practice-areas/');
    const urlArea = new URLSearchParams(window.location.search).get('practice_area') || '';
    areas.forEach(a => {
      const opt = document.createElement('option');
      opt.value = a.PracticeArea;
      opt.textContent = a.PracticeArea;
      if (a.PracticeArea === urlArea) opt.selected = true;
      select.appendChild(opt);
    });
  } catch {}
}
