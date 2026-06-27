/* =============================================
   HERO REVEAL — full-bleed portrait spotlight
   Base: clean cinematic grade of the photo.
   Cursor reveals a vivid, lit version with a soft
   neon ring. No glitch/duotone. Subject biased right.
   ============================================= */
import * as THREE from 'three';

const PORTRAITS = ['assets/portrait.png', 'assets/portrait.jpg', 'assets/portrait.webp'];
const host = document.getElementById('hero');
const canvas = document.getElementById('hero-reveal');

if (host && canvas) {
  (async () => {
    let url = null;
    for (const p of PORTRAITS) {
      try { const r = await fetch(p, { method: 'HEAD' }); if (r.ok) { url = p; break; } } catch (e) {}
    }
    if (url) init(url);
  })();
}

const vertex = `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`;

const fragment = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uMouse;
uniform float uHover;
uniform float uRadius;
uniform float uSoft;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uImg;
uniform float uCenterX;
uniform float uScale;

void main(){
  // FIT BY HEIGHT so the full head-and-shoulders is always visible,
  // then place the portrait horizontally at uCenterX (right side on desktop).
  float wFrac = (uImg.x/uImg.y) / (uRes.x/uRes.y) * uScale;  // portrait width as fraction of hero width
  vec2 uv;
  uv.x = (vUv.x - uCenterX) / wFrac + 0.5;
  uv.y = 1.0 - ((1.0 - vUv.y) / uScale);                     // full height (anchored top), uScale zoom

  float inside = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);

  vec4 texc = texture2D(uTex, uv);
  vec3 real = texc.rgb;
  float lum = dot(real, vec3(0.299,0.587,0.114));

  // base: clean cinematic — slightly cooler, gently dimmed (still looks good)
  vec3 base = mix(vec3(lum), real, 0.82);
  base *= 0.82;
  base += vec3(0.015,0.02,0.045);        // whisper of indigo in shadows

  // reveal: vivid, lifted, lightly warmed
  vec3 vivid = clamp(mix(vec3(lum), real, 1.18) * 1.08, 0.0, 1.0);

  // circular spotlight around cursor (aspect-correct)
  vec2 sr = uRes.x > uRes.y ? vec2(uRes.x/uRes.y,1.0) : vec2(1.0,uRes.y/uRes.x);
  float dist = distance(vUv*sr, uMouse*sr);
  float r = uRadius * (0.35 + 0.65*uHover);
  float mask = 1.0 - smoothstep(r - uSoft, r + uSoft, dist);

  vec3 col = mix(base, vivid, mask);

  // soft neon ring at the spotlight edge
  float ring = smoothstep(uSoft, 0.0, abs(dist - r)) * uHover;
  col += vec3(0.18,0.42,0.85) * ring * 0.5;

  gl_FragColor = vec4(col, inside * texc.a);
}
`;

function init(url) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' }); }
  catch (e) { canvas.style.display = 'none'; return; }
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const uniforms = {
    uTex: { value: null },
    uMouse: { value: new THREE.Vector2(0.66, 0.55) },
    uHover: { value: 0.0 },
    uRadius: { value: 0.5 },
    uSoft: { value: 0.18 },
    uTime: { value: 0 },
    uRes: { value: new THREE.Vector2(1, 1) },
    uImg: { value: new THREE.Vector2(1, 1) },
    uCenterX: { value: 0.72 },
    uScale: { value: 1.0 },
  };

  new THREE.TextureLoader().load(url, (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter; tex.generateMipmaps = false;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    uniforms.uTex.value = tex;
    if (tex.image) uniforms.uImg.value.set(tex.image.width, tex.image.height);
    resize();
    canvas.classList.add('ready');
  });

  const mat = new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms, transparent: true });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    uniforms.uRes.value.set(w, h);
    // place portrait on the right (desktop) or centered (mobile)
    uniforms.uCenterX.value = w > 900 ? 0.72 : 0.5;
  }
  window.addEventListener('resize', resize); resize();

  let tx = 0.66, ty = 0.55, hov = 0;
  window.addEventListener('mousemove', (e) => {
    const r = host.getBoundingClientRect();
    if (e.clientY < r.top || e.clientY > r.bottom) { hov = 0; return; }
    tx = (e.clientX - r.left) / r.width;
    ty = 1.0 - (e.clientY - r.top) / r.height;
    hov = 1;
  }, { passive: true });
  host.addEventListener('mouseleave', () => { hov = 0; });

  const clock = new THREE.Clock();
  function loop() {
    uniforms.uTime.value = clock.getElapsedTime();
    uniforms.uMouse.value.x += (tx - uniforms.uMouse.value.x) * 0.1;
    uniforms.uMouse.value.y += (ty - uniforms.uMouse.value.y) * 0.1;
    uniforms.uHover.value += (hov - uniforms.uHover.value) * 0.05;
    if (uniforms.uTex.value) renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  loop();
}
