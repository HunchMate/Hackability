import { Renderer, Program, Mesh, Triangle } from 'https://cdn.jsdelivr.net/npm/ogl@1.0.11/+esm';

const MAX_COLORS = 8;

const hexToRGB = hex => {
  const c = hex.replace('#', '').padEnd(6, '0');
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;
  return [r, g, b];
};

const prepColors = input => {
  const base = (input && input.length ? input : ['#A6C8FF', '#5227FF', '#FF9FFC']).slice(0, MAX_COLORS);
  const count = base.length;
  const arr = [];
  for (let i = 0; i < MAX_COLORS; i++) arr.push(hexToRGB(base[Math.min(i, base.length - 1)]));
  const avg = [0, 0, 0];
  for (let i = 0; i < count; i++) {
    avg[0] += arr[i][0];
    avg[1] += arr[i][1];
    avg[2] += arr[i][2];
  }
  avg[0] /= count;
  avg[1] /= count;
  avg[2] /= count;
  return { arr, count, avg };
};

const vertex = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `
precision highp float;

uniform vec3  iResolution;
uniform vec2  iMouse;
uniform float iTime;

uniform vec3  uColor0;
uniform vec3  uColor1;
uniform vec3  uColor2;
uniform vec3  uColor3;
uniform vec3  uColor4;
uniform vec3  uColor5;
uniform vec3  uColor6;
uniform vec3  uColor7;
uniform int   uColorCount;

uniform vec3  uBgColor;
uniform vec3  uMouseColor;
uniform float uSpeed;
uniform int   uStreakCount;
uniform float uStreakWidth;
uniform float uStreakLength;
uniform float uGlow;
uniform float uDensity;
uniform float uTwinkle;
uniform float uZoom;
uniform float uBgGlow;
uniform float uOpacity;
uniform float uMouseEnabled;
uniform float uMouseStrength;
uniform float uMouseRadius;

varying vec2 vUv;

vec3 palette(float h) {
  int count = uColorCount;
  if (count < 1) count = 1;
  int idx = int(floor(clamp(h, 0.0, 0.999999) * float(count)));
  if (idx <= 0) return uColor0;
  if (idx == 1) return uColor1;
  if (idx == 2) return uColor2;
  if (idx == 3) return uColor3;
  if (idx == 4) return uColor4;
  if (idx == 5) return uColor5;
  if (idx == 6) return uColor6;
  return uColor7;
}

vec3 tanhv(vec3 x) {
  vec3 e = exp(-2.0 * x);
  return (1.0 - e) / (1.0 + e);
}

vec2 sceneC(vec2 frag, vec2 r) {
  vec2 P = (frag + frag - r) / r.x;
  float z = 0.0;
  float d = 1e3;
  vec4 O = vec4(0.0);
  for (int k = 0; k < 39; k++) {
    if (d <= 1e-4) break;
    O = z * normalize(vec4(P, uZoom, 0.0)) - vec4(0.0, 4.0, 1.0, 0.0) / 4.5;
    d = 1.0 - sqrt(length(O * O));
    z += d;
  }
  return vec2(O.x, atan(O.z, O.y));
}

void mainImage(out vec4 o, vec2 C) {
  vec2 r = iResolution.xy;
  vec2 uv0 = (C + C - r) / r.x;
  float T = 0.1 * iTime * uSpeed + 9.0;
  float angRings = max(1.0, floor(6.28318530718 * max(uDensity, 0.05) + 0.5));
  vec2 Y = vec2(5e-3, 6.28318530718 / angRings);

  vec2 c0 = sceneC(C, r);
  vec2 cdx = sceneC(C + vec2(1.0, 0.0), r);
  vec2 cdy = sceneC(C + vec2(0.0, 1.0), r);
  vec2 dCx = cdx - c0;
  vec2 dCy = cdy - c0;
  dCx.y -= 6.28318530718 * floor(dCx.y / 6.28318530718 + 0.5);
  dCy.y -= 6.28318530718 * floor(dCy.y / 6.28318530718 + 0.5);
  vec2 fw = abs(dCx) + abs(dCy);
  C = c0;

  vec2 P = vec2(2.0, 1.0) * uv0 - (r / r.x) * vec2(0.0, 1.0);
  vec4 O = vec4(uBgColor * 90.0 * uBgGlow / (1e3 * dot(P, P) + 6.0), 0.0);

  float mGlow = 0.0;
  if (uMouseEnabled > 0.5) {
    vec2 mN = (iMouse + iMouse - r) / r.x;
    float md = length(uv0 - mN);
    mGlow = exp(-md * md / max(uMouseRadius * uMouseRadius, 1e-4)) * uMouseStrength;
    O.rgb += uMouseColor * mGlow * 0.25;
  }

  float zr = 5e-4 * uStreakWidth;
  vec2 rr = vec2(max(length(fw), 1e-5));
  float tail = 19.0 / max(uStreakLength, 0.05);

  for (int m = 0; m < 16; m++) {
    if (m >= uStreakCount) break;
    float jf = float(m) + 1.0;
    float ic = fract(sin(dot(vec2(jf, floor(C.x / Y.x + 0.5)), vec2(7.0, 11.0)) * 73.0));
    vec2 Pp = C - (T + T * ic) * vec2(0.0, 1.0);
    Pp -= floor(Pp / Y + 0.5) * Y;
    float h = fract(8663.0 * ic);
    vec3 col = palette(h);
    float weight = mix(1.5, 1.0 + sin(T + 7.0 * h + 4.0), uTwinkle);
    weight *= (1.0 + mGlow * 2.0);
    vec2 inner = vec2(length(max(Pp, vec2(-1.0, 0.0))), length(Pp) - zr) - zr;
    vec2 sm = vec2(1.0) - smoothstep(-rr, rr, inner);
    O.rgb += dot(sm, vec2(exp(tail * Pp.y), 3.0)) * col * weight;
    C.x += Y.x / 8.0;
  }

  vec3 colr = sqrt(tanhv(max(O.rgb * uGlow - vec3(0.04, 0.08, 0.02), 0.0)));
  o = vec4(colr, uOpacity);
}

void main() {
  vec4 color;
  mainImage(color, vUv * iResolution.xy);
  gl_FragColor = color;
}
`;

export class LightfallEffect {
  constructor(container, options = {}) {
    this.container = container;
    this.dpr = options.dpr || window.devicePixelRatio || 1;
    this.paused = options.paused || false;
    this.colors = options.colors || ['#A6C8FF', '#5227FF', '#FF9FFC'];
    this.backgroundColor = options.backgroundColor || '#0A29FF';
    this.speed = options.speed !== undefined ? options.speed : 0.5;
    this.streakCount = options.streakCount !== undefined ? options.streakCount : 2;
    this.streakWidth = options.streakWidth !== undefined ? options.streakWidth : 1;
    this.streakLength = options.streakLength !== undefined ? options.streakLength : 1;
    this.glow = options.glow !== undefined ? options.glow : 1;
    this.density = options.density !== undefined ? options.density : 0.6;
    this.twinkle = options.twinkle !== undefined ? options.twinkle : 1;
    this.zoom = options.zoom !== undefined ? options.zoom : 3;
    this.backgroundGlow = options.backgroundGlow !== undefined ? options.backgroundGlow : 0.5;
    this.opacity = options.opacity !== undefined ? options.opacity : 1;
    this.mouseInteraction = options.mouseInteraction !== undefined ? options.mouseInteraction : true;
    this.mouseStrength = options.mouseStrength !== undefined ? options.mouseStrength : 0.5;
    this.mouseRadius = options.mouseRadius !== undefined ? options.mouseRadius : 1;
    this.mouseDampening = options.mouseDampening !== undefined ? options.mouseDampening : 0.15;
    this.mixBlendMode = options.mixBlendMode;

    this.mouseTarget = [0, 0];
    this.lastTime = 0;
    this.raf = null;

    if (this.mixBlendMode) {
      this.container.style.mixBlendMode = this.mixBlendMode;
    }

    this.init();
  }

  init() {
    this.renderer = new Renderer({
      dpr: this.dpr,
      alpha: true,
      antialias: true
    });
    
    const gl = this.renderer.gl;
    this.canvas = gl.canvas;

    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    this.canvas.style.position = 'absolute';
    this.canvas.style.inset = '0';
    this.canvas.style.zIndex = '0';
    this.container.appendChild(this.canvas);

    const { arr, count, avg } = prepColors(this.colors);

    this.uniforms = {
      iResolution: { value: [gl.drawingBufferWidth, gl.drawingBufferHeight, 1] },
      iMouse: { value: [0, 0] },
      iTime: { value: 0 },
      uColor0: { value: arr[0] },
      uColor1: { value: arr[1] },
      uColor2: { value: arr[2] },
      uColor3: { value: arr[3] },
      uColor4: { value: arr[4] },
      uColor5: { value: arr[5] },
      uColor6: { value: arr[6] },
      uColor7: { value: arr[7] },
      uColorCount: { value: count },
      uBgColor: { value: hexToRGB(this.backgroundColor) },
      uMouseColor: { value: avg },
      uSpeed: { value: this.speed },
      uStreakCount: { value: Math.max(1, Math.min(16, Math.round(this.streakCount))) },
      uStreakWidth: { value: this.streakWidth },
      uStreakLength: { value: this.streakLength },
      uGlow: { value: this.glow },
      uDensity: { value: this.density },
      uTwinkle: { value: this.twinkle },
      uZoom: { value: this.zoom },
      uBgGlow: { value: this.backgroundGlow },
      uOpacity: { value: this.opacity },
      uMouseEnabled: { value: this.mouseInteraction ? 1 : 0 },
      uMouseStrength: { value: this.mouseStrength },
      uMouseRadius: { value: this.mouseRadius }
    };

    this.program = new Program(gl, { vertex, fragment, uniforms: this.uniforms });
    this.geometry = new Triangle(gl);
    this.mesh = new Mesh(gl, { geometry: this.geometry, program: this.program });

    this.resize = () => {
      const rect = this.container.getBoundingClientRect();
      this.renderer.setSize(rect.width, rect.height);
      this.uniforms.iResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight, 1];
    };

    this.resize();
    this.ro = new ResizeObserver(this.resize);
    this.ro.observe(this.container);

    this.onPointerMove = e => {
      const rect = this.canvas.getBoundingClientRect();
      const scale = this.renderer.dpr || 1;
      const x = (e.clientX - rect.left) * scale;
      const y = (rect.height - (e.clientY - rect.top)) * scale;
      this.mouseTarget = [x, y];
      if (this.mouseDampening <= 0) {
        this.uniforms.iMouse.value = [x, y];
      }
    };
    
    if (this.mouseInteraction) {
      this.canvas.addEventListener('pointermove', this.onPointerMove);
    }

    this.loop = t => {
      this.raf = requestAnimationFrame(this.loop);
      this.uniforms.iTime.value = t * 0.001;
      
      if (this.mouseDampening > 0) {
        if (!this.lastTime) this.lastTime = t;
        const dt = (t - this.lastTime) / 1000;
        this.lastTime = t;
        const tau = Math.max(1e-4, this.mouseDampening);
        let factor = 1 - Math.exp(-dt / tau);
        if (factor > 1) factor = 1;
        const cur = this.uniforms.iMouse.value;
        cur[0] += (this.mouseTarget[0] - cur[0]) * factor;
        cur[1] += (this.mouseTarget[1] - cur[1]) * factor;
      } else {
        this.lastTime = t;
      }
      
      if (!this.paused && this.program && this.mesh) {
        try {
          this.renderer.render({ scene: this.mesh });
        } catch (e) {
          console.error(e);
        }
      }
    };
    
    this.raf = requestAnimationFrame(this.loop);
  }

  destroy() {
    if (this.raf) cancelAnimationFrame(this.raf);
    if (this.mouseInteraction) this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.ro.disconnect();
    if (this.canvas && this.canvas.parentElement === this.container) {
      this.container.removeChild(this.canvas);
    }
    if (this.program) this.program.remove();
    if (this.geometry) this.geometry.remove();
    if (this.mesh) this.mesh.remove();
    if (this.renderer) this.renderer.destroy();
  }
}
