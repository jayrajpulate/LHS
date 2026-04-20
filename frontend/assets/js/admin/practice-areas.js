/**
 * LHS Admin — Practice Areas Management
 */
let editAreaId = null;

document.addEventListener('DOMContentLoaded', () => {
  requireAuth();
  initSidebar();
  fetchAreas();

  document.getElementById('add-area-form')?.addEventListener('submit', addArea);
  document.getElementById('edit-area-form')?.addEventListener('submit', updateArea);
});

async function fetchAreas() {
  const list = document.getElementById('areas-list');
  list.innerHTML = `<div class="text-center py-4"><div class="loader-ring mx-auto"></div></div>`;
  try {
    const areas = await api.get('/practice-areas/');
    document.getElementById('area-count').textContent = areas.length;
    if (!areas.length) {
      list.innerHTML = `<div class="text-center text-muted py-5"><p>No practice areas yet. Add your first one!</p></div>`;
      return;
    }
    list.innerHTML = `<div class="list-group list-group-flush">
      ${areas.map((a, i) => `
        <div class="list-group-item d-flex align-items-center justify-content-between py-3 animate-in" id="area-item-${a.id}" style="animation-delay:${i * 0.04}s">
          <div class="d-flex align-items-center gap-3">
            <div style="width:36px;height:36px;background:linear-gradient(135deg,rgba(26,58,92,0.1),rgba(201,168,76,0.15));border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;">⚖️</div>
            <div>
              <span id="area-name-${a.id}" class="fw-semibold">${a.PracticeArea}</span>
              <div class="text-muted" style="font-size:0.75rem">Added by ${a.AddedBy || 'Admin'} · ${formatDate(a.CreationDate)}</div>
            </div>
          </div>
          <div class="d-flex gap-2">
            <button class="action-btn edit" onclick="openEditArea(${a.id}, '${a.PracticeArea.replace(/'/g, "\\'")}')" title="Edit"><i class="bi bi-pencil"></i></button>
            <button class="action-btn delete" onclick="deleteArea(${a.id})" title="Delete"><i class="bi bi-trash"></i></button>
          </div>
        </div>`).join('')}
    </div>`;
  } catch (err) {
    list.innerHTML = `<div class="text-danger text-center py-4">${err.message}</div>`;
    showToast(err.message, 'error');
  }
}

async function addArea(e) {
  e.preventDefault();
  const input = document.getElementById('new-area-name');
  const btn   = e.target.querySelector('[type="submit"]');
  const name  = input.value.trim();
  if (!name) return;

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
  try {
    await api.post('/practice-areas/', { PracticeArea: name });
    input.value = '';
    showToast(`"${name}" added successfully!`, 'success');
    fetchAreas();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="bi bi-plus-lg"></i> Add';
  }
}

function openEditArea(id, currentName) {
  editAreaId = id;
  document.getElementById('edit-area-name').value = currentName;
  new bootstrap.Modal(document.getElementById('edit-area-modal')).show();
}

async function updateArea(e) {
  e.preventDefault();
  if (!editAreaId) return;
  const name = document.getElementById('edit-area-name').value.trim();
  const btn  = e.target.querySelector('[type="submit"]');
  if (!name) return;

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
  try {
    await api.put(`/practice-areas/${editAreaId}`, { PracticeArea: name });
    showToast('Practice area updated!', 'success');
    bootstrap.Modal.getInstance(document.getElementById('edit-area-modal')).hide();
    fetchAreas();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Update';
  }
}

async function deleteArea(id) {
  const ok = await confirmAction('Delete this practice area? This cannot be undone.');
  if (!ok) return;
  try {
    await api.delete(`/practice-areas/${id}`);
    showToast('Practice area deleted.', 'success');
    const item = document.getElementById(`area-item-${id}`);
    if (item) { item.style.opacity = '0'; item.style.transform = 'translateX(30px)'; setTimeout(() => item.remove(), 300); }
    else fetchAreas();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

window.openEditArea = openEditArea;
window.deleteArea   = deleteArea;
