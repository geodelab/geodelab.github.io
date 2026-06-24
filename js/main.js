/* =============================================
   GEODELAB — main.js
   ============================================= */

/* ── INTERACTIVE PARTICLE CONSTELLATION NETWORK ── */
(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  const mouse = { x: -9999, y: -9999 };
  const COLORS = ['99,102,241', '129,140,248', '167,139,250'];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    const count = Math.min(110, Math.floor((W * H) / 14000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.8 + 0.6,
      c: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      // mouse repel / attract
      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const d = Math.hypot(dx, dy);
      if (d < 140) {
        const f = (140 - d) / 140 * 0.6;
        p.x += (dx / d) * f; p.y += (dy / d) * f;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.c},0.9)`;
      ctx.shadowBlur = 8; ctx.shadowColor = `rgba(${p.c},0.8)`;
      ctx.fill();
      ctx.shadowBlur = 0;

      // links
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dist = Math.hypot(p.x - q.x, p.y - q.y);
        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(${p.c},${(1 - dist / 130) * 0.18})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  window.addEventListener('mouseout', () => { mouse.x = -9999; mouse.y = -9999; });
  resize();
  draw();
})();

/* ── TYPEWRITER ── */
(function () {
  const el = document.getElementById('typewriter');
  if (!el) return;
  const roles = [
    'Solutions Architect',
    'AWS Data Architect',
    'GenAI Systems Builder',
    'Databricks Engineer',
    'Snowflake Platform Expert',
    'Data Lakehouse Designer',
    'Cloud Native Architect',
  ];
  let ri = 0, ci = 0, deleting = false;

  function tick() {
    const role = roles[ri];
    if (!deleting) {
      el.textContent = role.slice(0, ci + 1);
      ci++;
      if (ci === role.length) { deleting = true; setTimeout(tick, 2000); return; }
    } else {
      el.textContent = role.slice(0, ci - 1);
      ci--;
      if (ci === 0) { deleting = false; ri = (ri + 1) % roles.length; }
    }
    setTimeout(tick, deleting ? 45 : 80);
  }
  setTimeout(tick, 600);
})();

/* ── NAVBAR SCROLL ── */
(function () {
  const nav = document.getElementById('navbar');
  const ham = document.getElementById('ham');
  const links = document.getElementById('navLinks');

  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 50));

  ham?.addEventListener('click', () => {
    links.classList.toggle('open');
    const spans = ham.querySelectorAll('span');
    if (links.classList.contains('open')) {
      spans[0].style.cssText = 'transform:rotate(45deg) translate(5px,5px)';
      spans[1].style.opacity = '0';
      spans[2].style.cssText = 'transform:rotate(-45deg) translate(5px,-5px)';
    } else {
      spans.forEach(s => s.style = '');
    }
  });

  links?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    links.classList.remove('open');
    ham.querySelectorAll('span').forEach(s => s.style = '');
  }));
})();

/* ── COUNTER ANIMATION ── */
(function () {
  const counters = document.querySelectorAll('.metric-val');
  let fired = false;

  function run() {
    if (fired) return;
    const hero = document.getElementById('hero');
    if (!hero) return;
    if (hero.getBoundingClientRect().top < window.innerHeight) {
      fired = true;
      counters.forEach(el => {
        const target = parseInt(el.dataset.target);
        let v = 0;
        const step = Math.max(1, target / 45);
        const t = setInterval(() => {
          v = Math.min(v + step, target);
          el.textContent = Math.floor(v);
          if (v >= target) { el.textContent = target; clearInterval(t); }
        }, 35);
      });
    }
  }
  window.addEventListener('scroll', run, { passive: true });
  run();
})();

/* ── SKILL BAR ANIMATION ── */
(function () {
  const fills = document.querySelectorAll('.bar-fill');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const w = e.target.dataset.w;
        e.target.style.setProperty('--w', w);
        e.target.classList.add('anim');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });
  fills.forEach(f => obs.observe(f));
})();

/* ── TIMELINE CARDS REVEAL ── */
(function () {
  const items = document.querySelectorAll('.tl-item');
  items.forEach((item, i) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(24px)';
    item.style.transition = `opacity 0.6s ${i * 0.12}s, transform 0.6s ${i * 0.12}s`;
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach(item => obs.observe(item));
})();

/* ── SECTION FADE-IN ── */
(function () {
  const sections = document.querySelectorAll('section:not(#hero)');
  sections.forEach(s => {
    s.style.opacity = '0';
    s.style.transform = 'translateY(16px)';
    s.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });

  sections.forEach(s => obs.observe(s));
})();

/* ── CURSOR GLOW (desktop) ── */
(function () {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  const g = document.createElement('div');
  g.style.cssText = 'position:fixed;width:450px;height:450px;border-radius:50%;background:radial-gradient(circle,rgba(99,102,241,0.04) 0%,transparent 70%);pointer-events:none;z-index:1;transition:left .12s,top .12s;transform:translate(-50%,-50%)';
  document.body.appendChild(g);
  window.addEventListener('mousemove', e => {
    g.style.left = e.clientX + 'px';
    g.style.top = e.clientY + 'px';
  }, { passive: true });
})();

/* ── ARCH DIAGRAM NODE PULSE ── */
(function () {
  const nodes = document.querySelectorAll('.arch-node');
  let i = 0;
  setInterval(() => {
    nodes.forEach(n => n.style.boxShadow = '');
    if (nodes[i]) {
      nodes[i].style.boxShadow = '0 0 16px rgba(99,102,241,0.45)';
      nodes[i].style.transform = 'scale(1.04)';
      setTimeout(() => { if (nodes[i]) { nodes[i].style.boxShadow = ''; nodes[i].style.transform = ''; } }, 500);
    }
    i = (i + 1) % nodes.length;
  }, 800);
})();

/* ── CERT CARD GLOW ── */
document.querySelectorAll('.cert-card-sm').forEach(card => {
  const ac = getComputedStyle(card).getPropertyValue('--ac').trim();
  card.addEventListener('mouseenter', () => { card.style.boxShadow = `0 0 30px ${ac}30, 0 16px 40px rgba(0,0,0,0.5)`; });
  card.addEventListener('mouseleave', () => { card.style.boxShadow = ''; });
});

/* ── SMOOTH SCROLL ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
  });
});
