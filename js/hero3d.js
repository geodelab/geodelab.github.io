/* =============================================
   HERO 3D — Three.js living object
   Vibrant indigo→cyan→magenta wireframe icosahedron
   with glowing vertices + colour-shifting halo
   ============================================= */
import * as THREE from 'three';

const canvas = document.getElementById('hero-3d');
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

  const group = new THREE.Group();
  scene.add(group);

  // ── Inner glowing core (additive) ──
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.05, 1),
    new THREE.MeshBasicMaterial({ color: 0x6d5cff, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending })
  );
  group.add(core);

  // ── Outer wireframe (indigo) ──
  const geoOuter = new THREE.IcosahedronGeometry(1.6, 1);
  const wireOuter = new THREE.LineSegments(
    new THREE.WireframeGeometry(geoOuter),
    new THREE.LineBasicMaterial({ color: 0x7c7bff, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending })
  );
  group.add(wireOuter);

  // ── Mid wireframe (cyan), counter-rotated for shimmer ──
  const geoMid = new THREE.IcosahedronGeometry(1.32, 1);
  const wireMid = new THREE.LineSegments(
    new THREE.WireframeGeometry(geoMid),
    new THREE.LineBasicMaterial({ color: 0x2dd4ff, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending })
  );
  group.add(wireMid);

  // ── Glowing vertices (bright, additive) ──
  const pts = new THREE.Points(
    geoOuter,
    new THREE.PointsMaterial({ color: 0xf0abfc, size: 0.11, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  group.add(pts);

  // ── Colour-shifting particle halo ──
  const haloCount = 900;
  const positions = new Float32Array(haloCount * 3);
  const colors = new Float32Array(haloCount * 3);
  const palette = [
    new THREE.Color(0x6366f1), // indigo
    new THREE.Color(0x22d3ee), // cyan
    new THREE.Color(0xec4899), // magenta
    new THREE.Color(0xa78bfa), // violet
  ];
  for (let i = 0; i < haloCount; i++) {
    const r = 2.3 + Math.random() * 3.0;
    const t = Math.random() * Math.PI * 2;
    const p = Math.acos(2 * Math.random() - 1);
    positions[i * 3]     = r * Math.sin(p) * Math.cos(t);
    positions[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
    positions[i * 3 + 2] = r * Math.cos(p);
    const c = palette[(Math.random() * palette.length) | 0];
    colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
  }
  const haloGeo = new THREE.BufferGeometry();
  haloGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  haloGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const halo = new THREE.Points(haloGeo,
    new THREE.PointsMaterial({ size: 0.04, transparent: true, opacity: 0.85, vertexColors: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(halo);

  // ── Resize ──
  function resize() {
    const w = canvas.clientWidth || 460;
    const h = canvas.clientHeight || 480;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    group.position.set(0, 0, 0);
    camera.position.z = w < 420 ? 6 : 5;
  }
  window.addEventListener('resize', resize);
  resize();

  // ── Smooth mouse parallax ──
  let mx = 0, my = 0, tmx = 0, tmy = 0;
  window.addEventListener('mousemove', e => {
    tmx = (e.clientX / window.innerWidth - 0.5);
    tmy = (e.clientY / window.innerHeight - 0.5);
  }, { passive: true });

  // ── Animate — always alive ──
  const clock = new THREE.Clock();
  const hsl = { h: 0, s: 0, l: 0 };
  function animate() {
    const t = clock.getElapsedTime();
    mx += (tmx - mx) * 0.05;
    my += (tmy - my) * 0.05;

    // continuous, clearly-visible rotation
    group.rotation.y = t * 0.35 + mx * 0.9;
    group.rotation.x = t * 0.18 + my * 0.6;

    // counter-rotate the mid shell for a shimmering interplay
    wireMid.rotation.y = -t * 0.5;
    wireMid.rotation.z = t * 0.25;

    // breathing scale
    const s = 1 + Math.sin(t * 1.4) * 0.04;
    group.scale.set(s, s, s);

    // gentle hue cycling on the outer wireframe (indigo ↔ violet ↔ cyan)
    const hue = (0.62 + Math.sin(t * 0.25) * 0.08); // ~ indigo-violet band
    wireOuter.material.color.setHSL(hue, 0.85, 0.68);
    pts.material.color.getHSL(hsl);
    pts.material.color.setHSL((0.78 + Math.sin(t * 0.4) * 0.06), 0.9, 0.8);

    // drifting halo
    halo.rotation.y = -t * 0.06;
    halo.rotation.x = t * 0.03;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
}
