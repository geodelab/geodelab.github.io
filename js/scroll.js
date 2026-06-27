/* =============================================
   SCROLL — Lenis smooth scroll + GSAP ScrollTrigger
   Cinematic, unique reveal per section + progress bar
   ============================================= */
(function () {
  if (!window.gsap || !window.ScrollTrigger || !window.Lenis) return;
  gsap.registerPlugin(ScrollTrigger);

  /* ---- Lenis smooth (inertia) scrolling ---- */
  const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1.0, smoothWheel: true });
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
  if (bar) gsap.to(bar, {
    scaleX: 1, ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
  });

  const q = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reveal = (el, vars) => gsap.from(el, Object.assign({
    ease: 'power3.out', duration: 1.1,
    scrollTrigger: { trigger: el, start: 'top 84%' },
  }, vars));

  /* ---- section titles: clip wipe + rise ---- */
  q('.sec-title, .sec-label').forEach((el) => {
    gsap.from(el, {
      yPercent: 40, opacity: 0, duration: 1, ease: 'power4.out',
      clipPath: 'inset(0 0 100% 0)',
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });

  /* ---- ABOUT: text + chips stagger, avatar pop ---- */
  reveal(q('.about-text p'), { y: 60, opacity: 0, stagger: 0.12 });
  reveal(q('.about-chips .chip'), { y: 30, opacity: 0, scale: 0.8, stagger: 0.05, duration: 0.7 });
  const orbit = document.querySelector('.avatar-orbit');
  if (orbit) gsap.from(orbit, {
    scale: 0.6, opacity: 0, rotate: -25, duration: 1.3, ease: 'back.out(1.6)',
    scrollTrigger: { trigger: orbit, start: 'top 85%' },
  });
  const company = document.querySelector('.about-company');
  if (company) reveal(company, { y: 50, opacity: 0 });

  /* ---- EXPERIENCE: timeline line draws + cards slide alternating ---- */
  q('.tl-line').forEach((line) => {
    gsap.set(line, { transformOrigin: 'top center' });
    gsap.from(line, {
      scaleY: 0, ease: 'none',
      scrollTrigger: { trigger: line.closest('.tl-item'), start: 'top 80%', end: 'bottom 60%', scrub: true },
    });
  });
  q('.tl-item').forEach((item, i) => {
    const card = item.querySelector('.tl-card');
    const dot = item.querySelector('.tl-dot');
    if (dot) gsap.from(dot, { scale: 0, duration: 0.5, ease: 'back.out(2)',
      scrollTrigger: { trigger: item, start: 'top 80%' } });
    if (card) gsap.from(card, {
      x: i % 2 ? 90 : -90, opacity: 0, rotateY: i % 2 ? 8 : -8, duration: 1.1, ease: 'power3.out',
      scrollTrigger: { trigger: item, start: 'top 80%' },
    });
  });

  /* ---- SKILLS: domain cards flip-up, stack tiles pop ---- */
  q('.domain-card').forEach((card) => {
    gsap.from(card, {
      y: 80, opacity: 0, rotateX: -22, transformPerspective: 800, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: card, start: 'top 86%' },
    });
  });
  reveal(q('.stack-item'), { y: 40, opacity: 0, scale: 0.6, stagger: 0.04, duration: 0.6, ease: 'back.out(1.7)' });

  /* ---- CERTIFICATIONS: 3D tilt-in cascade ---- */
  q('.cert-group').forEach((group) => {
    const cards = q('.cert-full-card', group);
    gsap.from(cards, {
      y: 70, opacity: 0, rotateX: -30, transformPerspective: 900, transformOrigin: 'center top',
      duration: 0.9, ease: 'power3.out', stagger: 0.1,
      scrollTrigger: { trigger: group, start: 'top 82%' },
    });
  });
  reveal(q('.cert-count-item'), { y: 30, opacity: 0, scale: 0.7, stagger: 0.1, ease: 'back.out(1.7)' });

  /* ---- PROJECTS: rise + scale, featured parallax ---- */
  const hero = document.querySelector('.proj-hero-card');
  if (hero) {
    gsap.from(hero, { y: 100, opacity: 0, scale: 0.94, duration: 1.2, ease: 'power3.out',
      scrollTrigger: { trigger: hero, start: 'top 85%' } });
    gsap.to(hero, { yPercent: -8, ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top bottom', end: 'bottom top', scrub: true } });
  }
  q('.proj-sm-card').forEach((card, i) => {
    gsap.from(card, { y: 80, opacity: 0, scale: 0.9, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: card, start: 'top 88%' }, delay: (i % 2) * 0.08 });
  });

  /* ---- SPEAKING: alternate slide ---- */
  q('.speak-card').forEach((card, i) => {
    gsap.from(card, { x: i % 2 ? 80 : -80, opacity: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: card, start: 'top 86%' } });
  });

  /* ---- EDUCATION ---- */
  const edu = document.querySelector('.edu-card');
  if (edu) reveal(edu, { y: 70, opacity: 0, scale: 0.96 });

  /* ---- CONTACT: zoom-in ---- */
  const contact = document.querySelector('.contact-inner');
  if (contact) gsap.from(contact, {
    scale: 0.85, opacity: 0, y: 60, duration: 1.2, ease: 'power3.out',
    scrollTrigger: { trigger: contact, start: 'top 85%' },
  });
  reveal(q('.ccard'), { y: 40, opacity: 0, stagger: 0.08 });

  /* ---- parallax on ambient aurora ---- */
  q('.aurora-blob').forEach((b, i) => {
    gsap.to(b, { yPercent: (i + 1) * 12, ease: 'none',
      scrollTrigger: { start: 0, end: 'max', scrub: 1 } });
  });

  /* ---- active nav link highlighting ---- */
  q('section[id]').forEach((sec) => {
    const link = document.querySelector(`.nav-links a[href="#${sec.id}"]`);
    if (!link) return;
    ScrollTrigger.create({
      trigger: sec, start: 'top 55%', end: 'bottom 55%',
      onToggle: (self) => link.classList.toggle('active', self.isActive),
    });
  });

  ScrollTrigger.refresh();
})();
