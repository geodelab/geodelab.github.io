/* =============================================
   HERO REVEAL — cursor "spotlight" portrait
   One photo: shader paints a cyberpunk/holographic
   version as the base layer; the cursor reveals the
   real photo underneath through a soft glowing circle.
   Inspired by the shader-mask reveal technique.
   Activates only when assets/portrait.(png|jpg) exists.
   ============================================= */
import * as THREE from 'three';

const PORTRAITS = ['assets/portrait.png', 'assets/portrait.jpg', 'assets/portrait.webp'];
const host = document.querySelector('.hero-right');

if (host) {
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
uniform vec2 uMouse;      // 0..1
uniform float uHover;     // 0..1
uniform float uRadius;
uniform float uSoft;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uImg;

void main(){
  // cover-fit UVs
  vec2 ratio = vec2(
    min((uRes.x/uRes.y)/(uImg.x/uImg.y), 1.0),
    min((uRes.y/uRes.x)/(uImg.y/uImg.x), 1.0)
  );
  vec2 uv = (vUv - 0.5) * ratio + 0.5;

  vec4 real = texture2D(uTex, uv);

  // ---- cyberpunk / holographic stylized base ----
  float lum = dot(real.rgb, vec3(0.299,0.587,0.114));
  vec3 deep  = vec3(0.05,0.06,0.16);   // indigo shadow
  vec3 cyan  = vec3(0.16,0.85,0.96);   // cyan light
  vec3 styl = mix(deep, cyan, smoothstep(0.12,0.85,lum));
  styl = floor(styl * 6.0) / 6.0;                    // posterize
  styl += vec3(0.10,0.0,0.12) * smoothstep(0.6,0.95,lum); // magenta highlights
  float scan = sin((vUv.y*uRes.y)*1.2 + uTime*2.0) * 0.05; // scanlines
  styl -= scan;

  // circular reveal mask around cursor
  vec2 sr = uRes.x > uRes.y ? vec2(uRes.x/uRes.y,1.0) : vec2(1.0,uRes.y/uRes.x);
  float dist = distance(vUv*sr, uMouse*sr);
  float r = uRadius * uHover;
  float mask = 1.0 - smoothstep(r - uSoft, r + uSoft, dist);

  vec3 col = mix(styl, real.rgb, mask);

  // neon ring at the reveal edge
  float ring = smoothstep(uSoft, 0.0, abs(dist - r)) * uHover;
  col += vec3(0.25,0.55,0.95) * ring * 0.6;

  gl_FragColor = vec4(col, real.a);
}
`;

function init(url) {
  let renderer;
  const canvas = document.createElement('canvas');
  canvas.id = 'hero-reveal';
  host.appendChild(canvas);
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' }); }
  catch (e) { canvas.remove(); return; }
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const uniforms = {
    uTex: { value: null },
    uMouse: { value: new THREE.Vector2(0.5, 0.55) },
    uHover: { value: 0.0 },
    uRadius: { value: 0.42 },
    uSoft: { value: 0.16 },
    uTime: { value: 0 },
    uRes: { value: new THREE.Vector2(1, 1) },
    uImg: { value: new THREE.Vector2(1, 1) },
  };

  new THREE.TextureLoader().load(url, (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter; tex.generateMipmaps = false;
    uniforms.uTex.value = tex;
    if (tex.image) uniforms.uImg.value.set(tex.image.width, tex.image.height);
    // photo is ready — hide the fallback character + wireframe
    document.querySelector('.char-stage')?.style.setProperty('opacity', '0');
    const g = document.getElementById('hero-3d'); if (g) g.style.opacity = '0.12';
    canvas.classList.add('ready');
  }, undefined, () => { canvas.remove(); });

  const mat = new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms, transparent: true });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

  function resize() {
    const w = host.clientWidth || 460, h = host.clientHeight || 480;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    uniforms.uRes.value.set(w, h);
  }
  window.addEventListener('resize', resize); resize();

  // smoothed cursor + hover ramp
  let tx = 0.5, ty = 0.55, hov = 0;
  host.addEventListener('mousemove', (e) => {
    const r = host.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width;
    ty = 1.0 - (e.clientY - r.top) / r.height;
  }, { passive: true });
  host.addEventListener('mouseenter', () => { hov = 1; });
  host.addEventListener('mouseleave', () => { hov = 0; });
  // mobile: reveal follows touch
  host.addEventListener('touchmove', (e) => {
    if (!e.touches[0]) return; const t = e.touches[0]; const r = host.getBoundingClientRect();
    tx = (t.clientX - r.left) / r.width; ty = 1.0 - (t.clientY - r.top) / r.height; hov = 1;
  }, { passive: true });

  const clock = new THREE.Clock();
  function loop() {
    uniforms.uTime.value = clock.getElapsedTime();
    uniforms.uMouse.value.x += (tx - uniforms.uMouse.value.x) * 0.1;
    uniforms.uMouse.value.y += (ty - uniforms.uMouse.value.y) * 0.1;
    uniforms.uHover.value += (hov - uniforms.uHover.value) * 0.06;
    if (uniforms.uTex.value) renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  loop();
}
