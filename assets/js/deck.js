/*
 * Moteur de présentation commun aux decks.
 * - Slides 1280 × 720 mises à l'échelle de la fenêtre (même rendu que le PPT).
 * - Navigation : boutons, clavier (← → Espace Début Fin), swipe, menu des slides, lien direct #n.
 * - Plein écran (F), impression / PDF (une slide par page).
 * - Petits écrans : lecture en défilement vertical.
 */
(() => {
  const W = 1280;
  const H = 720;
  const narrow = window.matchMedia('(max-width: 759px)'); // même seuil que deck.css

  const viewport = document.querySelector('.viewport');
  const stage = document.querySelector('.stage');
  const slides = [...document.querySelectorAll('.slide')];
  if (!viewport || !stage || slides.length === 0) return;

  const $ = (id) => document.getElementById(id);
  const prevBtn = $('prevBtn');
  const nextBtn = $('nextBtn');
  const counter = $('counter');
  const progress = $('progress');
  const menuBtn = $('menuBtn');
  const menu = $('slideMenu');
  const fullBtn = $('fullBtn');
  const printBtn = $('printBtn');

  let current = 0;
  const isScroll = () => document.body.classList.contains('is-scroll');

  // ---- Mise à l'échelle ----
  function fit() {
    const scroll = narrow.matches;
    document.body.classList.toggle('is-scroll', scroll);
    if (scroll) {
      stage.style.transform = '';
      document.documentElement.style.setProperty('--s', String(viewport.clientWidth / W));
      return;
    }
    const pad = document.fullscreenElement ? 0 : 32;
    const s = Math.min((viewport.clientWidth - pad) / W, (viewport.clientHeight - pad) / H);
    stage.style.transform = `translate(-50%, -50%) scale(${s})`;
  }

  // ---- Navigation ----
  function go(n, { updateHash = true } = {}) {
    current = Math.max(0, Math.min(slides.length - 1, n));
    slides.forEach((s, k) => {
      const active = k === current;
      s.classList.toggle('is-active', active);
      s.setAttribute('aria-hidden', String(!active && !isScroll()));
    });
    if (counter) counter.textContent = `${current + 1} / ${slides.length}`;
    if (progress) progress.style.width = `${((current + 1) / slides.length) * 100}%`;
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current === slides.length - 1;
    if (menu) menu.querySelectorAll('a').forEach((a, k) => a.classList.toggle('is-current', k === current));
    if (updateHash) history.replaceState(null, '', `#${current + 1}`);
    if (isScroll()) {
      const top = (document.querySelector('.topbar')?.offsetHeight || 0) + 8;
      window.scrollTo({ top: slides[current].getBoundingClientRect().top + window.scrollY - top, behavior: updateHash ? 'smooth' : 'auto' });
    }
  }

  const fromHash = () => {
    const n = parseInt(location.hash.replace('#', ''), 10);
    return Number.isFinite(n) ? n - 1 : 0;
  };

  // ---- Menu des slides ----
  function buildMenu() {
    if (!menu) return;
    menu.innerHTML = slides
      .map((s, k) => `<a href="#${k + 1}" data-n="${k}"><span>${k + 1}</span>${s.dataset.title || `Slide ${k + 1}`}</a>`)
      .join('');
    menu.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      e.preventDefault();
      go(Number(a.dataset.n));
      toggleMenu(false);
    });
  }

  function toggleMenu(open) {
    if (!menu || !menuBtn) return;
    const show = open ?? menu.hidden;
    menu.hidden = !show;
    menuBtn.setAttribute('aria-expanded', String(show));
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.();
  }

  // ---- Événements ----
  prevBtn?.addEventListener('click', () => go(current - 1));
  nextBtn?.addEventListener('click', () => go(current + 1));
  menuBtn?.addEventListener('click', (e) => { e.stopPropagation(); toggleMenu(); });
  fullBtn?.addEventListener('click', toggleFullscreen);
  printBtn?.addEventListener('click', () => window.print());
  document.addEventListener('click', (e) => { if (menu && !menu.hidden && !menu.contains(e.target)) toggleMenu(false); });

  document.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.target.closest('input, textarea, select')) return;
    const keys = {
      ArrowRight: () => go(current + 1), ArrowDown: () => go(current + 1), PageDown: () => go(current + 1),
      ' ': () => go(current + 1), ArrowLeft: () => go(current - 1), ArrowUp: () => go(current - 1),
      PageUp: () => go(current - 1), Home: () => go(0), End: () => go(slides.length - 1),
      f: toggleFullscreen, F: toggleFullscreen, Escape: () => toggleMenu(false),
    };
    if (isScroll() && ['ArrowDown', 'ArrowUp', ' ', 'PageDown', 'PageUp'].includes(e.key)) return; // défilement natif
    if (keys[e.key]) { e.preventDefault(); keys[e.key](); }
  });

  let touchX = 0;
  let touchY = 0;
  viewport.addEventListener('touchstart', (e) => { touchX = e.changedTouches[0].clientX; touchY = e.changedTouches[0].clientY; }, { passive: true });
  viewport.addEventListener('touchend', (e) => {
    if (isScroll()) return;
    const dx = e.changedTouches[0].clientX - touchX;
    const dy = e.changedTouches[0].clientY - touchY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(current + (dx < 0 ? 1 : -1));
  }, { passive: true });

  // En défilement (mobile), la slide courante est la première sous la barre du haut
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!isScroll() || ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const top = (document.querySelector('.topbar')?.offsetHeight || 0) + 8;
      const k = slides.findIndex((s) => s.getBoundingClientRect().bottom > top + 40);
      if (k >= 0 && k !== current) {
        current = k;
        if (counter) counter.textContent = `${current + 1} / ${slides.length}`;
        if (progress) progress.style.width = `${((current + 1) / slides.length) * 100}%`;
        history.replaceState(null, '', `#${current + 1}`);
      }
    });
  }, { passive: true });

  window.addEventListener('resize', fit);
  narrow.addEventListener('change', () => { fit(); go(current, { updateHash: false }); });
  document.addEventListener('fullscreenchange', () => { document.body.classList.toggle('is-full', !!document.fullscreenElement); fit(); });
  window.addEventListener('hashchange', () => go(fromHash(), { updateHash: false }));

  buildMenu();
  fit();
  go(fromHash(), { updateHash: false });
  document.body.classList.add('is-ready');
})();
