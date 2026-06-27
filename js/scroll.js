/* =============================================
   SCROLL — Lenis smooth scroll + GSAP ScrollTrigger
   Cinematic, unique reveal per section + progress bar
   ============================================= */
(function () {
  if (!window.gsap || !window.ScrollTrigger || !window.Lenis) return;
  gsap.registerPlugin(ScrollTrigger);

  /* ---- Lenis smooth (inertia) scrolling ---- */
  const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1.0, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  /* ---- anchor links use Lenis ---- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    const id = a.getAttribute('href');
    if (id.length > 1) a.addEventListener('click', (e) => {
      const el = document.querySelector(id);
      if (el) { e.preventDefault(); lenis.scrollTo(el, { offset: -64, duration: 1.4 }); }
    });
  });

  /* ---- top progress bar ---- */
  const bar = document.getElementById('scrollProgress');
  if (bar) gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

  const q = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* reveal a group, triggered by a real container element (not an array) */
  function group(selector, triggerSel, vars) {
    const els = q(selector);
    const trigger = document.querySelector(triggerSel) || els[0];
    if (!els.length || !trigger) return;
    gsap.from(els, Object.assign({
      ease: 'power3.out', duration: 0.9,
      scrollTrigger: { trigger, start: 'top 85%' },
    }, vars));
  }
  /* reveal each element by itself */
  function each(selector, vars) {
    q(selector).forEach((el, i) => gsap.from(el, Object.assign({
      ease: 'power3.out', duration: 1,
      scrollTrigger: { trigger: el, start: 'top 86%' },
    }, typeof vars === 'function' ? vars(i) : vars)));
  }

  /* ---- section titles: clean rise + fade ---- */
  each('.sec-label', { y: 24, opacity: 0, duration: 0.7 });
  each('.sec-title', { y: 44, opacity: 0, duration: 0.9, ease: 'power4.out' });

  /* ---- ABOUT ---- */
  group('.about-text p', '.about-text', { y: 50, opacity: 0, stagger: 0.12 });
  group('.about-chips .chip', '.about-chips', { y: 24, opacity: 0, scale: 0.85, stagger: 0.05, duration: 0.6 });
  const orbit = document.querySelector('.avatar-orbit');
  if (orbit) gsap.from(orbit, { scale: 0.7, opacity: 0, duration: 1.1, ease: 'back.out(1.5)',
    scrollTrigger: { trigger: orbit, start: 'top 85%' } });
  each('.about-company', { y: 40, opacity: 0 });

  /* ---- EXPERIENCE: timeline line draws + cards slide alternating ---- */
  q('.tl-line').forEach((line) => {
    gsap.set(line, { transformOrigin: 'top center' });
    gsap.from(line, { scaleY: 0, ease: 'none',
      scrollTrigger: { trigger: line.closest('.tl-item'), start: 'top 80%', end: 'bottom 60%', scrub: true } });
  });
  q('.tl-item').forEach((item, i) => {
    const card = item.querySelector('.tl-card');
    const dot = item.querySelector('.tl-dot');
    if (dot) gsap.from(dot, { scale: 0, duration: 0.5, ease: 'back.out(2)',
      scrollTrigger: { trigger: item, start: 'top 82%' } });
    if (card) gsap.from(card, { x: i % 2 ? 70 : -70, opacity: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: item, start: 'top 82%' } });
  });

  /* ---- SKILLS: clean rise + stagger (no 3D) ---- */
  q('.domain-card').forEach((card, i) => {
    gsap.from(card, { y: 60, opacity: 0, scale: 0.97, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: card, start: 'top 88%' } });
  });
  group('.stack-item', '.stack-grid', { y: 30, opacity: 0, scale: 0.7, stagger: 0.04, duration: 0.5, ease: 'back.out(1.6)' });

  /* ---- CERTIFICATIONS: clean rise cascade (no skew) ---- */
  group('.cert-count-item', '.cert-count-row', { y: 24, opacity: 0, scale: 0.8, stagger: 0.1, ease: 'back.out(1.6)' });
  q('.cert-group').forEach((g) => {
    const cards = q('.cert-full-card', g);
    gsap.from(cards, { y: 50, opacity: 0, scale: 0.96, duration: 0.8, ease: 'power3.out', stagger: 0.08,
      scrollTrigger: { trigger: g, start: 'top 84%' } });
  });

  /* ---- PROJECTS ---- */
  const hero = document.querySelector('.proj-hero-card');
  if (hero) {
    gsap.from(hero, { y: 80, opacity: 0, scale: 0.95, duration: 1.1, ease: 'power3.out',
      scrollTrigger: { trigger: hero, start: 'top 86%' } });
    gsap.to(hero, { yPercent: -6, ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top bottom', end: 'bottom top', scrub: true } });
  }
  each('.proj-sm-card', { y: 60, opacity: 0, scale: 0.94, duration: 0.9 });

  /* ---- SPEAKING ---- */
  q('.speak-card').forEach((card, i) => {
    gsap.from(card, { x: i % 2 ? 60 : -60, opacity: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: card, start: 'top 86%' } });
  });

  /* ---- EDUCATION ---- */
  each('.edu-card', { y: 50, opacity: 0, scale: 0.97 });

  /* ---- CONTACT ---- */
  const lead = document.querySelector('.contact-lead');
  if (lead) each('.contact-lead', { y: 30, opacity: 0 });
  group('.ccard', '.contact-cards', { y: 36, opacity: 0, scale: 0.9, stagger: 0.08 });
  const sayHello = document.querySelector('.btn-xl');
  if (sayHello) gsap.from(sayHello, { scale: 0.8, opacity: 0, duration: 0.8, ease: 'back.out(1.6)',
    scrollTrigger: { trigger: sayHello, start: 'top 90%' } });

  /* ---- ambient aurora parallax ---- */
  q('.aurora-blob').forEach((b, i) => {
    gsap.to(b, { yPercent: (i + 1) * 10, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 1 } });
  });

  /* ---- active nav link ---- */
  q('section[id]').forEach((sec) => {
    const link = document.querySelector(`.nav-links a[href="#${sec.id}"]`);
    if (!link) return;
    ScrollTrigger.create({ trigger: sec, start: 'top 55%', end: 'bottom 55%',
      onToggle: (self) => link.classList.toggle('active', self.isActive) });
  });

  ScrollTrigger.refresh();
})();
