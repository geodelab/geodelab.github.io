/* =============================================
   SCENE 3D — section-aware background object
   One fixed renderer; morphs into a distinct shape +
   colour for each section as you scroll. Performant.
   ============================================= */
import * as THREE from 'three';

const canvas = document.getElementById('scene-3d');
let renderer = null;
if (canvas) {
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true }); }
  catch (e) { canvas.style.display = 'none'; }
}

if (canvas && renderer) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.z = 6;
  renderer.setClearColor(0x000000, 0);

  // distinct shape + colour per section id
  const SHAPES = {
    about:          { geo: () => new THREE.TorusKnotGeometry(1.5, 0.45, 160, 24), color: 0x22d3ee },
    experience:     { geo: () => new THREE.OctahedronGeometry(2, 0),             color: 0x6366f1 },
    skills:         { geo: () => new THREE.IcosahedronGeometry(2, 1),            color: 0xa855f7 },
    certifications: { geo: () => new THREE.DodecahedronGeometry(2, 0),           color: 0xec4899 },
    projects:       { geo: () => new THREE.TorusGeometry(1.7, 0.5, 20, 60),      color: 0x34d399 },
    speaking:       { geo: () => new THREE.ConeGeometry(1.8, 2.6, 8, 1),         color: 0x22d3ee },
    education:      { geo: () => new THREE.SphereGeometry(2, 18, 14),            color: 0x818cf8 },
    contact:        { geo: () => new THREE.TorusKnotGeometry(1.4, 0.5, 140, 20, 2, 3), color: 0xec4899 },
  };

  const group = new THREE.Group();
  scene.add(group);

  const mat = new THREE.LineBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
  let mesh = new THREE.LineSegments(new THREE.WireframeGeometry(SHAPES.about.geo()), mat);
  group.add(mesh);

  let targetColor = new THREE.Color(0x6366f1);
  let swapScale = 1; // for pop-in transition

  function setShape(key) {
    const s = SHAPES[key]; if (!s) return;
    const old = mesh;
    const g = new THREE.WireframeGeometry(s.geo());
    mesh = new THREE.LineSegments(g, mat);
    mesh.scale.setScalar(0.01); swapScale = 0.01;
    group.add(mesh);
    group.remove(old); old.geometry.dispose();
    targetColor = new THREE.Color(s.color);
  }

  // observe sections, switch shape when one is centered
  const ids = Object.keys(SHAPES);
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting && SHAPES[e.target.id]) setShape(e.target.id); });
  }, { threshold: 0.4 });
  ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });

  // fade the whole canvas in only after the hero (keeps hero clean)
  let visTarget = 0;
  const hero = document.getElementById('hero');
  const heroObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { visTarget = e.isIntersecting ? 0 : 1; });
  }, { threshold: 0.25 });
  if (hero) heroObs.observe(hero);

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    group.position.x = w > 900 ? 2.6 : 0;   // sit to the right on desktop
  }
  window.addEventListener('resize', resize);
  resize();

  let mx = 0, my = 0, tmx = 0, tmy = 0, vis = 0;
  window.addEventListener('mousemove', e => {
    tmx = e.clientX / window.innerWidth - 0.5;
    tmy = e.clientY / window.innerHeight - 0.5;
  }, { passive: true });

  // pause when tab hidden (saves battery / keeps 60fps elsewhere)
  let running = true;
  document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) loop(); });

  const clock = new THREE.Clock();
  function loop() {
    if (!running) return;
    const t = clock.getElapsedTime();
    mx += (tmx - mx) * 0.04; my += (tmy - my) * 0.04;
    vis += (visTarget - vis) * 0.06;
    canvas.style.opacity = (vis * 0.5).toFixed(3);

    group.rotation.y = t * 0.22 + mx * 0.5;
    group.rotation.x = t * 0.12 + my * 0.4;

    if (swapScale < 1) { swapScale = Math.min(1, swapScale + 0.06); mesh.scale.setScalar(swapScale); }
    mat.color.lerp(targetColor, 0.05);

    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  loop();
}
