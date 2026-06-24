/* =============================================
   AVATAR — interactive VRM anime engineer
   Loads assets/avatar.vrm if present. Adds head/eye
   cursor tracking, blinking, breathing, neon glow.
   Falls back silently to the geometric hero object
   when no .vrm is available.
   ============================================= */
import * as THREE from 'three';

const VRM_URL = 'assets/avatar.vrm';
const host = document.querySelector('.hero-right');
if (host) {
  // probe for the file first; only download the heavy VRM libs if it exists
  fetch(VRM_URL, { method: 'HEAD' })
    .then(r => { if (r.ok) return loadLibsAndInit(); })
    .catch(() => { /* no avatar yet — keep geometric object */ });
}

async function loadLibsAndInit() {
  const [{ GLTFLoader }, { VRMLoaderPlugin, VRMUtils }] = await Promise.all([
    import('./vendor/GLTFLoader.js'),
    import('./vendor/three-vrm.module.js'),
  ]);
  initAvatar(GLTFLoader, VRMLoaderPlugin, VRMUtils);
}

function initAvatar(GLTFLoader, VRMLoaderPlugin, VRMUtils) {
  let renderer;
  const canvas = document.createElement('canvas');
  canvas.id = 'avatar-canvas';
  host.appendChild(canvas);
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true }); }
  catch (e) { canvas.remove(); return; }

  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 20);
  camera.position.set(0, 1.32, 1.45);

  // ── Cinematic + neon lighting ──
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.1); key.position.set(1, 2, 2); scene.add(key);
  const rimIndigo = new THREE.PointLight(0x6366f1, 8, 6); rimIndigo.position.set(-1.2, 1.6, -0.6); scene.add(rimIndigo);
  const rimMagenta = new THREE.PointLight(0xec4899, 6, 6); rimMagenta.position.set(1.3, 1.2, -0.8); scene.add(rimMagenta);
  const rimCyan = new THREE.PointLight(0x22d3ee, 5, 5); rimCyan.position.set(0.2, 0.6, 1.4); scene.add(rimCyan);

  // ── Look-at target driven by cursor ──
  const lookTarget = new THREE.Object3D();
  lookTarget.position.set(0, 1.3, 2);
  scene.add(lookTarget);

  let vrm = null, head = null, spine = null;
  const loader = new GLTFLoader();
  loader.register(parser => new VRMLoaderPlugin(parser));

  loader.load(VRM_URL, (gltf) => {
    vrm = gltf.userData.vrm;
    VRMUtils.removeUnnecessaryVertices(gltf.scene);
    VRMUtils.combineSkeletons(gltf.scene);
    vrm.scene.rotation.y = Math.PI;        // face the camera
    scene.add(vrm.scene);
    if (vrm.lookAt) vrm.lookAt.target = lookTarget;
    head = vrm.humanoid.getNormalizedBoneNode('head');
    spine = vrm.humanoid.getNormalizedBoneNode('spine');
    // hide the geometric fallback now that the character is here
    const geo = document.getElementById('hero-3d');
    if (geo) geo.style.opacity = '0';
    host.querySelector('.hero-3d-badge')?.style && (host.querySelector('.hero-3d-badge').textContent = '● ONLINE · AI ENGINEER');
  }, undefined, () => { canvas.remove(); });

  // ── Cursor (smoothed) ──
  let tmx = 0, tmy = 0, mx = 0, my = 0;
  window.addEventListener('mousemove', e => {
    tmx = (e.clientX / window.innerWidth - 0.5);
    tmy = (e.clientY / window.innerHeight - 0.5);
  }, { passive: true });

  // ── Blink scheduling ──
  let blink = 0, nextBlink = 1.5;

  function resize() {
    const w = host.clientWidth || 460, h = host.clientHeight || 480;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  const clock = new THREE.Clock();
  function loop() {
    const dt = clock.getDelta();
    const t = clock.elapsedTime;
    mx += (tmx - mx) * 0.06; my += (tmy - my) * 0.06;

    // move look target with cursor (eyes + head via lookAt)
    lookTarget.position.set(mx * 2.4, 1.3 - my * 1.4, 2);

    if (vrm) {
      // subtle head follow on top of lookAt
      if (head) {
        head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, mx * 0.5, 0.1);
        head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, my * 0.3, 0.1);
      }
      // breathing + idle sway
      if (spine) {
        spine.rotation.x = Math.sin(t * 1.1) * 0.015;
        spine.position.y = Math.sin(t * 1.1) * 0.004;
      }
      // blinking
      nextBlink -= dt;
      if (nextBlink <= 0) { blink = 1; nextBlink = 2.5 + Math.random() * 3; }
      blink = Math.max(0, blink - dt * 7);
      vrm.expressionManager?.setValue('blink', blink > 0.5 ? 1 : blink * 2);
      vrm.expressionManager?.setValue('happy', 0.15 + Math.abs(mx) * 0.25); // slight smile toward cursor
      vrm.update(dt);
    }

    // neon lights gently pulse
    rimIndigo.intensity = 7 + Math.sin(t * 1.3) * 2;
    rimMagenta.intensity = 5 + Math.sin(t * 1.7 + 1) * 2;

    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  loop();
}
