/**
 * LHS — Homepage JavaScript
 * Handles: hero counter, featured lawyers, practice areas, about snippet
 * NOTE: Navbar, back-to-top, loader, and reveals are handled by animations.js
 */
document.addEventListener('DOMContentLoaded', async () => {
  initHeroParticles();
  await Promise.all([
    loadAboutSnippet(),
    loadPracticeAreas(),
  ]);
  loadStats();

  // After all dynamic content is loaded, refresh scroll calculations
  // Use a small delay to let the DOM settle after innerHTML injections
  setTimeout(() => {
    if (typeof refreshScroll === 'function') refreshScroll();
  }, 300);
});

// ── Hero Particle Background ──────────────────────────────────────────
function initHeroParticles() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2 + 0.5,
    dx: (Math.random() - 0.5) * 0.4,
    dy: (Math.random() - 0.5) * 0.4,
    alpha: Math.random() * 0.4 + 0.1,
  }));

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201, 168, 76, ${p.alpha})`;
      ctx.fill();
      p.x += p.dx; p.y += p.dy;
      if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
    });
    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

// ── About Snippet ─────────────────────────────────────────────────────
async function loadAboutSnippet() {
  const el = document.getElementById('about-text');
  if (!el) return;
  try {
    const data = await api.get('/pages/aboutus');
    el.textContent = data.PageDescription
      ? data.PageDescription.slice(0, 280) + (data.PageDescription.length > 280 ? '...' : '')
      : '';
  } catch {
    el.textContent = 'Connecting lawyers with clients across India.';
  }
}

// ── Featured Lawyers ──────────────────────────────────────────────────
async function loadFeaturedLawyers() {
  const container = document.getElementById('featured-lawyers');
  if (!container) return;
  try {
    const data = await api.get('/lawyers/?per_page=8');
    const lawyers = data.lawyers || [];
    if (!lawyers.length) {
      container.innerHTML = '<p class="text-muted col-12 text-center py-4">No lawyers listed yet.</p>';
      return;
    }
    container.innerHTML = lawyers.map(lawyer => createLawyerCard(lawyer)).join('');

    // Handled by animations.js ScrollTrigger
    if (typeof initScrollReveals === 'function') initScrollReveals();
  } catch (err) {
    container.innerHTML = `<p class="text-danger col-12 text-center">${err.message}</p>`;
  }
}

function createLawyerCard(lawyer) {
  const imgUrl = getLawyerImageUrl(lawyer.ProfilePic);
  const areas = (lawyer.PracticeAreas || '').split(',').filter(Boolean).slice(0, 2);
  return `
    <div class="col-lg-3 col-md-6 mb-4 lawyer-card-wrap">
      <div class="lawyer-card">
        <div class="card-img-wrapper">
          ${imgUrl
            ? `<img src="${imgUrl}" class="card-img-top" alt="${lawyer.LawyerName}" loading="lazy">`
            : `<div class="card-img-top d-flex align-items-center justify-content-center" style="height:240px;background:linear-gradient(135deg,#333335,#5a5a5c);color:#fff;font-size:3rem;font-weight:900;">${getInitials(lawyer.LawyerName)}</div>`}
          <div class="card-overlay">
            <a href="lawyer-detail.html?id=${lawyer.id}" class="btn btn-sm btn-accent">View Profile</a>
          </div>
        </div>
        <div class="card-body">
          <h5 class="card-title">${lawyer.LawyerName}</h5>
          <div class="mb-2">
            ${areas.map(a => `<span class="practice-badge">${a.trim()}</span>`).join('')}
          </div>
          <div class="card-meta">
            ${lawyer.City ? `<div><i class="bi bi-geo-alt-fill"></i> ${lawyer.City}${lawyer.State ? ', ' + lawyer.State : ''}</div>` : ''}
            ${lawyer.LawyerExp ? `<div><i class="bi bi-briefcase-fill"></i> ${lawyer.LawyerExp}+ years experience</div>` : ''}
          </div>
          <a href="lawyer-detail.html?id=${lawyer.id}" class="btn btn-primary-lhs btn-sm w-100">View Profile</a>
        </div>
      </div>
    </div>`;
}

// ── Practice Areas ─────────────────────────────────────────────────────
const AREA_ICONS = {
  'criminal': '⚖️', 'family': '👨‍👩‍👧', 'corporate': '🏢',
  'property': '🏠', 'tax':      '💰', 'civil':   '📋',
  'labour':   '👷', 'immigration': '✈️', 'divorce': '💔',
  'contract': '📝', 'intellectual': '💡', 'banking': '🏦',
};

function getAreaIcon(name) {
  const key = Object.keys(AREA_ICONS).find(k => name.toLowerCase().includes(k));
  return AREA_ICONS[key] || '⚖️';
}

async function loadPracticeAreas() {
  const container = document.getElementById('practice-areas-grid');
  if (!container) return;
  try {
    const areas = await api.get('/practice-areas/');
    if (!areas.length) { container.innerHTML = '<p class="col-12 text-center text-muted">No practice areas yet.</p>'; return; }
    container.innerHTML = areas.slice(0, 12).map((area, i) => `
      <div class="col-6 col-md-4 col-lg-2 mb-3">
        <a href="lawyers.html?practice_area=${encodeURIComponent(area.PracticeArea)}" class="text-decoration-none">
          <div class="practice-card">
            <div class="icon-wrap">${getAreaIcon(area.PracticeArea)}</div>
            <h5>${area.PracticeArea}</h5>
          </div>
        </a>
      </div>`).join('');
    if (typeof initScrollReveals === 'function') initScrollReveals();
  } catch {
    container.innerHTML = '';
  }
}

// ── Stats Counter ──────────────────────────────────────────────────────
async function loadStats() {
  try {
    const [lawyerData, areaData] = await Promise.all([
      api.get('/lawyers/?per_page=1'),
      api.get('/practice-areas/'),
    ]);
    const statsMap = {
      'stat-lawyers': lawyerData.total || 0,
      'stat-areas': areaData.length || 0,
    };
    
    Object.entries(statsMap).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          onEnter: () => {
            gsap.to({ val: 0 }, {
              val: val,
              duration: 2,
              ease: 'power3.out',
              onUpdate: function() {
                el.innerText = Math.ceil(this.targets()[0].val);
              }
            });
          }
        });
      }
    });
  } catch {}
}

// ── Hero Search ────────────────────────────────────────────────────────
(function initHeroSearch() {
  const form = document.getElementById('hero-search-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const q = document.getElementById('hero-search-input').value.trim();
    if (q) window.location.href = `lawyers.html?name=${encodeURIComponent(q)}`;
  });
})();
