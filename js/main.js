/* KUMO // OPS — progressive enhancement only. All content is in the HTML. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- reveals (once per element) ---- */
  if (!rm && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -12% 0px' });
    $$('[data-reveal]').forEach((el) => { el.classList.add('will-reveal'); io.observe(el); });
  }

  /* ---- clock (IST) ---- */
  const clock = $('#clock');
  if (clock) {
    const f = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
    const tick = () => { clock.textContent = f.format(new Date()); };
    tick(); setInterval(tick, 30000);
  }

  /* ---- active nav link ---- */
  const links = $$('.bar__nav a');
  if ('IntersectionObserver' in window) {
    const so = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => { if (a.hash === '#' + e.target.id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    }), { rootMargin: '-45% 0px -50% 0px' });
    $$('main > section[id]').forEach((s) => so.observe(s));
  }

  /* ---- episode list dialog ---- */
  const dlg = $('#episodes');
  const menuBtn = $('.bar__menu');
  if (dlg && dlg.showModal) {
    menuBtn.addEventListener('click', () => dlg.showModal());
    dlg.addEventListener('click', (e) => {
      if (e.target.closest('[data-close]') || e.target.closest('a')) dlg.close();
    });
  } else if (menuBtn) { menuBtn.hidden = true; }

  /* ---- matrix crosshair ---- */
  const table = $('#matrix');
  const clearX = () => $$('.x, .hit', table).forEach((c) => c.classList.remove('x', 'hit'));
  const cross = (cell) => {
    clearX();
    const row = cell.parentElement;
    const i = cell.cellIndex;
    [...row.cells].forEach((c) => c.classList.add('x'));
    $$('tr', table).forEach((r) => r.cells[i] && r.cells[i].classList.add('x'));
  };
  if (table) {
    const on = (e) => { const c = e.target.closest('tbody td'); if (c) cross(c); };
    table.addEventListener('pointerover', on);
    table.addEventListener('focusin', on);
    table.addEventListener('pointerleave', clearX);
    const wrap = table.parentElement;
    wrap.addEventListener('scroll', () => wrap.classList.toggle('is-end', wrap.scrollLeft + wrap.clientWidth >= wrap.scrollWidth - 4), { passive: true });
  }
  const highlightMatrix = (q) => {
    if (!table || !q) return '';
    const cell = $$('tbody td', table).find((c) => c.textContent.toLowerCase().includes(q));
    if (!cell) return '';
    cross(cell); cell.classList.add('hit');
    clearTimeout(highlightMatrix.t); highlightMatrix.t = setTimeout(clearX, 5000);
    cell.scrollIntoView({ behavior: rm ? 'auto' : 'smooth', block: 'center', inline: 'center' });
    const row = cell.parentElement;
    const head = $$('thead th', table).map((h) => h.textContent);
    const cap = row.cells[0].textContent;
    const out = [...row.cells].slice(1).map((c, k) => `  ${head[k + 1].padEnd(13)}${c.textContent}`);
    return [`${cap}  (matched "${q}" on ${head[cell.cellIndex]})`, ...out].join('\n');
  };

  /* ---- filter (certs) ---- */
  const fBtns = $$('.filter button');
  const fStatus = $('#filter-status');
  const filterCerts = (v) => {
    let n = 0;
    $$('.cert').forEach((c) => { const show = v === 'all' || c.dataset.vendor === v; c.hidden = !show; if (show) { n++; c.classList.add('is-in'); } });
    fBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === v)));
    if (fStatus) fStatus.textContent = `Showing ${n} credentials`;
  };
  fBtns.forEach((b) => b.addEventListener('click', () => filterCerts(b.dataset.filter)));

  /* ---- copy email ---- */
  const cStatus = $('#copy-status');
  $$('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(b.dataset.copy);
      b.textContent = 'Copied ✓'; b.classList.add('is-done');
      if (cStatus) cStatus.textContent = 'Email address copied';
      setTimeout(() => { b.textContent = 'Copy'; b.classList.remove('is-done'); }, 2000);
    } catch { location.href = 'mailto:' + b.dataset.copy; }
  }));

  /* ---- console ---- */
  const log = $('#console-log');
  const form = $('#console-form');
  const input = $('#console-in');
  if (!log || !form || !input) return;

  const SECTIONS = { start: 'top', hero: 'top', practice: 'do', do: 'do', map: 'map', matrix: 'map', work: 'work', projects: 'work', oss: 'oss', 'open-source': 'oss', writing: 'writing', articles: 'writing', community: 'community', talks: 'talks', career: 'career', experience: 'career', certs: 'certs', certifications: 'certs', contact: 'contact' };
  const EP = ['top', 'do', 'map', 'work', 'oss', 'writing', 'community', 'talks', 'career', 'certs', 'contact'];

  const focusSection = (id) => {
    const sec = document.getElementById(id);
    if (!sec) return false;
    const h = id === 'top' ? $('#h-hero') : $('h2[tabindex]', sec);
    sec.scrollIntoView({ behavior: rm ? 'auto' : 'smooth', block: 'start' });
    if (h) { if (!h.hasAttribute('tabindex')) h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    return true;
  };
  const go = (id) => (focusSection(id) ? `→ ${id === 'top' ? 'EP.00' : 'EP.' + String(EP.indexOf(id)).padStart(2, '0')} #${id}` : '');

  const CONTACT = 'email     ganesh.data.expert@gmail.com\nphone     +91 73581 82958\nlinkedin  linkedin.com/in/ganesh-kumar-ponraj\ngithub    github.com/geodelab\ntz        IST, UTC+5:30';
  const COMMANDS = {
    help: () => 'whoami  clouds  compare <svc>  projects  gauntlet  community\ncerts  talks  contact  goto <section>  clear\n\ngoto: start practice map work oss writing community talks career certs contact, or 0-10',
    whoami: () => 'Ganesh Kumar P. Data Architect at Aivar Innovations, Bangalore.\nMulti-cloud data and AI on AWS, Azure and Google Cloud.\n5+ years: lakehouses, streaming, migrations, greenfield builds, GenAI.',
    clouds: () => 'aws    azure    google cloud\nlakehouse & warehouse: databricks  snowflake\nmodes: cloud-native  cross-cloud  multi-cloud  cloud-agnostic\n       migrations (lift-and-shift, refactor)  greenfield\ntry: compare bigquery',
    compare: (q) => (q ? highlightMatrix(q) || `no match for "${q}". try: redshift, bigquery, kinesis, purview` : 'usage: compare <service>   e.g. compare redshift'),
    projects: () => ('CASE 01  Cloud-native lakehouse on AWS + Databricks\nCASE 02  Agentic AI platform with MCP\nCASE 03  MLOps pipeline on Databricks\nCASE 04  Snowflake analytics hub\n→ goto work'),
    gauntlet: () => ('data-agent-gauntlet v0.1.1 · Apache-2.0\n20 tasks on Amazon Redshift Serverless, graded by the warehouse.\nbaseline arm vs skills arm · Claude Code and Kiro CLI\ngithub.com/geodelab/data-agent-gauntlet\n→ goto oss'),
    community: () => ('AWS communities   speaker, mentor, Builder Center author\nAzure community   talks and participation\nApache Doris      testing and benchmarking\n→ goto community'),
    certs: () => ('12 credentials · AWS 3 · Databricks 6 · Snowflake 3\nincl. AWS Solutions Architect – Professional,\n     Databricks Data Engineer Professional, SnowPro Core\n→ goto certs'),
    talks: () => ('4 sessions on sessionize.com/ganesh-kumar\nAWS Student Community Day Mysuru 2026 · 21 Nov 2026 · AI/ML track\n→ goto talks'),
    contact: () => CONTACT,
    goto: (s) => { const id = (Object.hasOwn(SECTIONS, s) && SECTIONS[s]) || (/^\d+$/.test(s) && EP[+s]); return id ? go(id) : 'usage: goto <section|ep>   e.g. goto talks, goto 4'; },
    clear: () => { log.replaceChildren(); return ''; },
    sudo: (a) => (a === 'hire ganesh' ? '[sudo] access granted.\n' + CONTACT : 'sudo: permission denied'),
  };
  const NAMES = Object.keys(COMMANDS).filter((k) => k !== 'sudo');

  const print = (text, cls) => {
    String(text).split('\n\n').forEach((block) => {
      const p = document.createElement('p');
      if (cls) p.className = cls;
      p.textContent = block;
      log.append(p);
    });
    log.scrollTop = log.scrollHeight;
  };
  const hist = []; let hi = 0;
  const run = (raw) => {
    raw = raw.trim(); if (!raw) return;
    hist.push(raw); hi = hist.length;
    print('$ ' + raw, 'echo');
    const [cmd, ...rest] = raw.toLowerCase().split(/\s+/);
    const fn = Object.prototype.hasOwnProperty.call(COMMANDS, cmd) ? COMMANDS[cmd] : null;
    const r = fn ? fn(rest.join(' ')) : `command not found: ${cmd}. try 'help'`;
    if (r) print(r, fn ? '' : 'err');
  };

  form.addEventListener('submit', (e) => { e.preventDefault(); run(input.value); input.value = ''; });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') { if (hi > 0) input.value = hist[--hi]; e.preventDefault(); }
    else if (e.key === 'ArrowDown') { hi = Math.min(hi + 1, hist.length); input.value = hist[hi] || ''; e.preventDefault(); }
    else if (e.key === 'Tab' && input.value) {
      const v = input.value.toLowerCase();
      const [c, arg] = v.split(/\s+/);
      const pool = arg !== undefined && c === 'goto' ? Object.keys(SECTIONS).map((k) => 'goto ' + k) : NAMES;
      const m = pool.filter((k) => k.startsWith(v));
      if (m.length) { e.preventDefault(); input.value = m.length === 1 ? m[0] + (pool === NAMES ? ' ' : '') : m.reduce((a, b) => { let i = 0; while (a[i] === b[i]) i++; return a.slice(0, i); }); }
      if (m.length > 1) print(m.join('  '), 'dim');
    }
    else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); log.replaceChildren(); }
    else if (e.key === 'Escape') { input.blur(); }
  });
  $$('[data-cmd]').forEach((b) => b.addEventListener('click', () => { run(b.dataset.cmd); }));

  const focusConsole = () => { input.focus({ preventScroll: true }); $('#console').scrollIntoView({ behavior: rm ? 'auto' : 'smooth', block: 'center' }); };
  $$('a[href="#console"]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); focusConsole(); }));
  document.addEventListener('keydown', (e) => {
    if ((e.key === '/' || e.key === '`') && !e.ctrlKey && !e.metaKey && !e.altKey && !/^(input|textarea|select)$/i.test(e.target.tagName) && !e.target.isContentEditable) {
      e.preventDefault(); focusConsole();
    }
  });

  /* ---- boot lines, once per session ---- */
  let booted = false;
  try { booted = sessionStorage.getItem('kumo-boot') === '1'; sessionStorage.setItem('kumo-boot', '1'); } catch { /* private mode */ }
  if (!booted && !rm) {
    const lines = ['[ok] mount /clouds/aws /clouds/azure /clouds/gcp', '[ok] attach lakehouse: databricks, snowflake', '[ok] load agents', 'ready.'];
    log.replaceChildren();
    let i = 0;
    const step = () => {
      print(lines[i], 'ok');
      if (++i < lines.length) setTimeout(step, 220);
      else print("type 'help' or pick a command below.", 'dim');
    };
    setTimeout(step, 250);
  }
})();
