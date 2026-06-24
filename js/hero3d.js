/* =============================================
   HERO 3D — Three.js animated object
   Premium indigo wireframe icosahedron + particle halo
   ============================================= */
import * as THREE from 'three';

const canvas = document.getElementById('hero-3d');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let renderer = null;
if (canvas) {
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch (e) {
    canvas.style.display = 'none'; // WebGL unavailable — degrade gracefully
  }
}
if (canvas && renderer) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.z = 5;

  renderer.setClearColor(0x000000, 0);

  // ── Group so we can offset toward the right of the hero ──
  const group = new THREE.Group();
  scene.add(group);

  // ── Wireframe icosahedron ──
  const geo = new THREE.IcosahedronGeometry(1.5, 1);
  const wire = new THREE.LineSegments(
    new THREE.WireframeGeometry(geo),
    new THREE.LineBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.55 })
  );
  group.add(wire);

  // ── Inner glowing solid (subtle) ──
  const inner = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.46, 1),
    new THREE.MeshBasicMaterial({ color: 0x4338ca, transparent: true, opacity: 0.08 })
  );
  group.add(inner);

  // ── Vertex glow points ──
  const pts = new THREE.Points(
    geo,
    new THREE.PointsMaterial({ color: 0xa78bfa, size: 0.07, transparent: true, opacity: 0.9 })
  );
  group.add(pts);

  // ── Particle halo around it ──
  const haloCount = 600;
  const positions = new Float32Array(haloCount * 3);
  for (let i = 0; i < haloCount; i++) {
    const r = 2.4 + Math.random() * 2.6;
    const t = Math.random() * Math.PI * 2;
    const p = Math.acos(2 * Math.random() - 1);
    positions[i * 3]     = r * Math.sin(p) * Math.cos(t);
    positions[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
    positions[i * 3 + 2] = r * Math.cos(p);
  }
  const haloGeo = new THREE.BufferGeometry();
  haloGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const halo = new THREE.Points(haloGeo,
    new THREE.PointsMaterial({ color: 0x818cf8, size: 0.025, transparent: true, opacity: 0.7 }));
  scene.add(halo);

  // ── Resize handling — fit hero, shift object right on wide screens ──
  function resize() {
    const w = canvas.clientWidth || 460;
    const h = canvas.clientHeight || 480;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    // object centered in its column; pull camera back a touch on narrow canvases
    group.position.set(0, 0, 0);
    camera.position.z = w < 420 ? 6 : 5;
  }
  window.addEventListener('resize', resize);
  resize();

  // ── Mouse parallax ──
  let mx = 0, my = 0;
  window.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth - 0.5);
    my = (e.clientY / window.innerHeight - 0.5);
  }, { passive: true });

  // ── Animate (or render a single static frame if reduced-motion) ──
  const clock = new THREE.Clock();
  function animate() {
    const t = clock.getElapsedTime();
    group.rotation.y = t * 0.18 + mx * 0.6;
    group.rotation.x = t * 0.10 + my * 0.4;
    const s = 1 + Math.sin(t * 1.2) * 0.03;
    group.scale.set(s, s, s);
    halo.rotation.y = -t * 0.04;
    halo.rotation.x = t * 0.02;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  if (reduceMotion) {
    group.rotation.set(0.3, 0.5, 0);
    renderer.render(scene, camera);
  } else {
    animate();
  }
}
