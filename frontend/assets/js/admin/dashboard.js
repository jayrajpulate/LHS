/**
 * LHS Admin — Dashboard JavaScript
 * Loads KPI stats, recent lawyers table
 */
document.addEventListener('DOMContentLoaded', async () => {
  requireAuth();
  initSidebar();
  await loadDashboardData();
});

async function loadDashboardData() {
  try {
    const [allLawyers, publicLawyers, areas] = await Promise.all([
      api.get('/lawyers/admin/all?per_page=1'),
      api.get('/lawyers/?per_page=1'),
      api.get('/practice-areas/'),
    ]);

    const stats = {
      'kpi-total-lawyers':   allLawyers.total  || 0,
      'kpi-public-lawyers':  publicLawyers.total || 0,
      'kpi-private-lawyers': (allLawyers.total - publicLawyers.total) || 0,
      'kpi-practice-areas':  areas.length || 0,
    };

    Object.entries(stats).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) animateCountUp(el, val, 1200);
    });

    // Recent lawyers
    const recent = await api.get('/lawyers/admin/all?per_page=8&page=1');
    renderRecentLawyers(recent.lawyers || []);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderRecentLawyers(lawyers) {
  const tbody = document.getElementById('recent-lawyers-tbody');
  if (!tbody) return;
  if (!lawyers.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No lawyers yet.</td></tr>';
    return;
  }
  tbody.innerHTML = lawyers.map(l => {
    const imgUrl = getLawyerImageUrl(l.ProfilePic);
    return `<tr class="animate-in">
      <td>
        <div class="d-flex align-items-center gap-3">
          ${imgUrl
            ? `<img src="${imgUrl}" class="table-avatar" alt="${l.LawyerName}">`
            : `<div class="table-avatar-placeholder">${getInitials(l.LawyerName)}</div>`}
          <div>
            <div class="fw-600">${l.LawyerName}</div>
            <div class="text-muted" style="font-size:0.78rem">${l.LawyerEmail || '—'}</div>
          </div>
        </div>
      </td>
      <td>${l.City || '—'}</td>
      <td>${(l.PracticeAreas || '—').split(',')[0].trim()}</td>
      <td>${l.LawyerExp ? l.LawyerExp + ' yrs' : '—'}</td>
      <td><span class="${l.IsPublic ? 'badge-public' : 'badge-private'}">${l.IsPublic ? 'Public' : 'Private'}</span></td>
      <td>${formatDate(l.RegDate)}</td>
    </tr>`;
  }).join('');
}
