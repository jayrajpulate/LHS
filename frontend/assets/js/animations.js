/**
 * LHS — Animation Engine
 * Stack: GSAP, Barba.js
 * 
 * This file handles ALL animation infrastructure:
 *  - Page loader intro
 *  - Scroll-triggered reveals
 *  - Magnetic buttons
 *  - Custom cursor
 *  - Barba.js page transitions
 *  - Navbar scroll effect & back-to-top
 */

let cursor, follower;

document.addEventListener('DOMContentLoaded', () => {
  // 1. Set up navbar + back-to-top (must work immediately)
  initNavbarScrollAnim();
  initBackToTopAnim();

  // 2. Set up custom cursor (desktop only)
  initCustomCursor();

  // 3. Run the intro loader animation, THEN init page content
  runIntroLoader();

  // 4. Set up Barba.js for subsequent navigations
  initBarba();
});

// =====================================================================
//  PAGE CONTENT INIT — called after loader clears & on Barba transitions
// =====================================================================
function initPageContent() {
  // Kill old ScrollTriggers to prevent stale triggers
  ScrollTrigger.getAll().forEach(t => t.kill());

  initScrollReveals();
  initHeroTimeline();
  initMagneticButtons();
  updateCursorInteractions();

  // Refresh after a tick to let the DOM settle
  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
  });
}

// =====================================================================
//  INTRO LOADER — Premium staggered text + progress bar reveal
// =====================================================================
function runIntroLoader() {
  const loader = document.getElementById('page-loader');

  // Safety: if no loader element, just init content immediately
  if (!loader) {
    initPageContent();
    return;
  }

  const chars = loader.querySelectorAll('.loader-char');
  const bar = loader.querySelector('.loader-bar');
  const content = loader.querySelector('.loader-content');

  // Safety: if loader exists but has old/broken markup, hide it and init
  if (!chars.length || !bar || !content) {
    loader.style.display = 'none';
    initPageContent();
    return;
  }

  const tl = gsap.timeline({
    onComplete: () => {
      loader.style.display = 'none';
      initPageContent();
    }
  });

  tl.to(chars, {
      opacity: 1,
      y: 0,
      stagger: 0.12,
      duration: 0.6,
      ease: 'back.out(1.7)'
    })
    .to(bar, {
      width: '100%',
      duration: 0.8,
      ease: 'power2.inOut'
    }, '-=0.3')
    .to(content, {
      y: -40,
      opacity: 0,
      duration: 0.4,
      ease: 'power2.in'
    })
    .to(loader, {
      yPercent: -100,
      duration: 0.6,
      ease: 'expo.inOut'
    }, '-=0.15');
}


// =====================================================================
//  NAVBAR SCROLL EFFECT
// =====================================================================
function initNavbarScrollAnim() {
  const navbar = document.querySelector('.lhs-navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });
}

// =====================================================================
//  BACK TO TOP
// =====================================================================
function initBackToTopAnim() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 400);
  });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// =====================================================================
//  CUSTOM CURSOR (desktop only)
// =====================================================================
function initCustomCursor() {
  if (window.innerWidth < 1024 || cursor) return;

  cursor = document.createElement('div');
  follower = document.createElement('div');
  cursor.className = 'custom-cursor';
  follower.className = 'custom-cursor-follower';
  document.body.appendChild(cursor);
  document.body.appendChild(follower);

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  gsap.ticker.add(() => {
    cursorX += (mouseX - cursorX) * 0.2;
    cursorY += (mouseY - cursorY) * 0.2;
    gsap.set(cursor, { x: cursorX - 10, y: cursorY - 10 });

    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    gsap.set(follower, { x: followerX - 20, y: followerY - 20 });
  });

  updateCursorInteractions();
}

function updateCursorInteractions() {
  if (!cursor) return;
  const interactives = document.querySelectorAll(
    'a, button, .practice-card, .lawyer-card, .faq-question, .filter-sidebar input, .filter-sidebar select'
  );
  interactives.forEach(el => {
    // Prevent duplicate listeners by marking
    if (el._cursorBound) return;
    el._cursorBound = true;

    el.addEventListener('mouseenter', () => {
      gsap.to(cursor, { scale: 1.8, duration: 0.3 });
      gsap.to(follower, { scale: 1.4, opacity: 0.4, backgroundColor: 'rgba(189, 140, 125, 0.25)', duration: 0.3 });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(cursor, { scale: 1, duration: 0.3 });
      gsap.to(follower, { scale: 1, opacity: 1, backgroundColor: 'transparent', duration: 0.3 });
    });
  });
}

// =====================================================================
//  HERO TIMELINE — staggered entry for hero/page-hero sections
// =====================================================================
function initHeroTimeline() {
  const hero = document.querySelector('.hero, .page-hero, .profile-hero');
  if (!hero) return;

  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

  // Only target elements INSIDE the hero to avoid false matches
  const badge = hero.querySelectorAll('.hero-badge, .breadcrumb-nav');
  const heading = hero.querySelectorAll('h1');
  const sub = hero.querySelectorAll('.lead, p');
  const search = hero.querySelectorAll('.search-hero, .hero-actions, #profile-avatar-wrap');
  const stats = hero.querySelectorAll('.hero-stat, .profile-meta > span');

  if (badge.length) tl.from(badge, { y: -20, opacity: 0, duration: 0.8 });
  if (heading.length) tl.from(heading, { y: 40, opacity: 0, duration: 1 }, '-=0.5');
  if (sub.length) tl.from(sub, { y: 20, opacity: 0, duration: 0.8 }, '-=0.7');
  if (search.length) tl.from(search, { scale: 0.95, opacity: 0, duration: 0.8 }, '-=0.6');
  if (stats.length) tl.from(stats, { y: 15, opacity: 0, stagger: 0.1, duration: 0.6 }, '-=0.5');
}

// =====================================================================
//  SCROLL REVEALS — fade/slide in on scroll
// =====================================================================
function initScrollReveals() {
  const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, [data-gsap-reveal]');

  reveals.forEach(el => {
    // Skip if already has a ScrollTrigger
    if (el._gsapRevealed) return;
    el._gsapRevealed = true;

    let x = 0, y = 25;
    if (el.classList.contains('reveal-left'))  { x = -40; y = 0; }
    if (el.classList.contains('reveal-right')) { x = 40;  y = 0; }

    gsap.from(el, {
      x, y,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none'
      }
    });
  });
}

// =====================================================================
//  MAGNETIC BUTTONS — hover pull effect
// =====================================================================
function initMagneticButtons() {
  const buttons = document.querySelectorAll('.btn-accent, .btn-primary-lhs, .navbar-brand, .social-icon');

  buttons.forEach(btn => {
    if (btn._magneticBound) return;
    btn._magneticBound = true;

    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(btn, {
        x: x * 0.3,
        y: y * 0.3,
        duration: 0.4,
        ease: 'power2.out'
      });
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.4)'
      });
    });
  });
}

// =====================================================================
//  BARBA.JS PAGE TRANSITIONS
// =====================================================================
function initBarba() {
  // Create transition overlay dynamically (must exist for Barba wipes)
  let overlay = document.querySelector('.transition-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'transition-overlay';
    document.body.appendChild(overlay);
  }

  barba.init({
    preventRunning: true,
    transitions: [{
      async leave(data) {
        const done = this.async();
        gsap.to(data.current.container, {
          opacity: 0,
          y: -15,
          duration: 0.35,
          ease: 'power2.in',
          onComplete: done
        });
      },
      async enter(data) {
        // Scroll to top for new page
        window.scrollTo(0, 0);

        // Hide the loader if the new page has one
        const newLoader = data.next.container.querySelector('#page-loader');
        if (newLoader) newLoader.style.display = 'none';

        // Animate new content in
        gsap.from(data.next.container, {
          opacity: 0,
          y: 15,
          duration: 0.35,
          ease: 'power2.out'
        });

        // Re-init page content for the new page
        initPageContent();
      }
    }]
  });
}

// =====================================================================
//  EXPOSE key functions globally so page-specific scripts can use them
// =====================================================================
window.initScrollReveals = initScrollReveals;
window.initPageContent = initPageContent;

/**
 * Call this after dynamically loading content that changes page height.
 * Refreshes GSAP ScrollTrigger positions.
 */
function refreshScroll() {
  ScrollTrigger.refresh();
}
window.refreshScroll = refreshScroll;
