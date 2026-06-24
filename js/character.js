/* =============================================
   ANIME CHARACTER — cursor interactions
   Eyes + head follow cursor, blinking, proximity glow
   ============================================= */
(function () {
  const root = document.getElementById('charRoot');
  const stage = document.getElementById('charStage');
  const head = document.getElementById('charHead');
  const pupils = document.getElementById('charPupils');
  const mouth = document.getElementById('charMouth');
  if (!root || !pupils) return;

  let tx = 0, ty = 0, cx = 0, cy = 0;

  window.addEventListener('mousemove', (e) => {
    const r = stage.getBoundingClientRect();
    const ox = r.left + r.width / 2;
    const oy = r.top + r.height * 0.42;
    tx = Math.max(-1, Math.min(1, (e.clientX - ox) / (r.width * 0.6)));
    ty = Math.max(-1, Math.min(1, (e.clientY - oy) / (r.height * 0.5)));

    // proximity: glow + smile when cursor is near the character
    const dist = Math.hypot(e.clientX - ox, e.clientY - oy);
    const near = dist < r.width * 0.75;
    stage.classList.toggle('near', near);
    if (mouth) mouth.setAttribute('d', near ? 'M192 254 q18 18 36 0' : 'M194 256 q16 14 32 0');
  }, { passive: true });

  function frame() {
    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;
    // pupils translate within the eye
    pupils.setAttribute('transform', `translate(${cx * 7}, ${cy * 5})`);
    // head subtly rotates + shifts toward cursor
    if (head) head.setAttribute('transform',
      `translate(${cx * 6}, ${cy * 4}) rotate(${cx * 4} 210 210)`);
    requestAnimationFrame(frame);
  }
  frame();

  // natural blinking
  function blink() {
    root.classList.add('char-blink');
    setTimeout(() => root.classList.remove('char-blink'), 120);
    // occasional double-blink
    if (Math.random() < 0.3) {
      setTimeout(() => { root.classList.add('char-blink'); setTimeout(() => root.classList.remove('char-blink'), 110); }, 260);
    }
    setTimeout(blink, 2600 + Math.random() * 3500);
  }
  setTimeout(blink, 1800);
})();
