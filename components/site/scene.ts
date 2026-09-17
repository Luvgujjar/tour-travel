/**
 * GLSL for the site background scene: sky (sun + clouds), shaded mountains,
 * wireframe contours, drifting snow and a flock of birds.
 * Kept apart from the React component so the shader code stays readable.
 */

// 2D simplex noise — Ian McEwan, Ashima Arts (MIT).
export const NOISE = /* glsl */ `
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}`;

export const WIDTH = 170;
export const DEPTH = 150;

/**
 * Ridged multifractal height field: sharp crests, broad ranges and a valley
 * floor down the middle so the camera always has somewhere to fly.
 */
const TERRAIN = (octaves: number) => /* glsl */ `
float ridged(vec2 p) {
  float n = 1.0 - abs(snoise(p));
  return n * n;
}
float terrain(vec2 p) {
  float valley = smoothstep(3.0, 26.0, abs(p.x));
  float amp = 1.0, freq = 0.021, sum = 0.0, norm = 0.0;
  for (int i = 0; i < ${octaves}; i++) {
    sum += amp * ridged(p * freq + float(i) * 7.3);
    norm += amp;
    amp *= 0.5;
    freq *= 2.1;
  }
  float ridges = pow(sum / norm, 1.7);
  float range = snoise(p * 0.011) * 0.5 + 0.5;
  return (ridges * 17.0 + range * 6.0) * valley - 1.4;
}`;

/** Shared position logic for the mountain passes. */
const TERRAIN_POS = (cell: number) => /* glsl */ `
vec3 terrainPoint(vec2 grid, float travel) {
  float shift = mod(travel, ${cell.toFixed(4)});
  float x = (grid.x - 0.5) * ${WIDTH.toFixed(1)};
  float z = -grid.y * ${DEPTH.toFixed(1)} + shift;
  return vec3(x, terrain(vec2(x, z - travel)), z);
}`;

/* ---------------- Sky: sun, glow and drifting clouds ---------------- */

export const SKY_VS = /* glsl */ `
attribute vec2 aPos;
varying vec2 vNdc;
void main() {
  vNdc = aPos;
  gl_Position = vec4(aPos, 0.999, 1.0);
}`;

export const skyFS = (octaves: number) => /* glsl */ `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 vNdc;
uniform vec3 uRight, uUp, uFwd, uSunDir, uSunColor, uCloudColor;
uniform float uTanFov, uAspect, uAlpha, uLight, uDrift, uTime, uCloudAmount;
${NOISE}
float fbm(vec2 p) {
  float amp = 0.55, sum = 0.0;
  for (int i = 0; i < ${octaves}; i++) {
    sum += amp * snoise(p);
    p = p * 2.02 + 4.1;
    amp *= 0.5;
  }
  return sum;
}
void main() {
  vec3 dir = normalize(uFwd + uRight * (vNdc.x * uTanFov * uAspect) + uUp * (vNdc.y * uTanFov));
  float sd = dot(dir, uSunDir);

  // Sun disc plus two glow falloffs.
  float disc = smoothstep(0.9994, 0.99975, sd);
  float glow = pow(max(sd, 0.0), 220.0) * 0.5 + pow(max(sd, 0.0), 14.0) * 0.22 + pow(max(sd, 0.0), 4.0) * 0.07;

  // Clouds live on a plane above the camera; they drift sideways with scroll and time.
  float above = smoothstep(0.015, 0.22, dir.y);
  vec2 q = dir.xz / max(dir.y, 0.05);
  vec2 drift = vec2(uDrift * 0.5 + uTime * 0.01, uDrift * 0.16);
  float shape = fbm(q * 0.06 + drift);
  shape += 0.5 * fbm(q * 0.14 - drift * 1.6);
  float cover = smoothstep(0.12, 0.62, shape + uCloudAmount);
  float density = cover * above * (1.0 - smoothstep(0.55, 1.0, dir.y));

  // Light the clouds from the sun side.
  vec3 cloud = mix(uCloudColor, uSunColor, pow(max(sd, 0.0), 3.0) * 0.8);
  cloud = mix(cloud * 0.75, cloud, smoothstep(0.1, 0.6, cover));

  vec3 col = uSunColor * (disc + glow) + cloud * density;
  float a = clamp(disc + glow * 0.75 + density * mix(0.55, 0.7, uLight), 0.0, 1.0);
  gl_FragColor = vec4(col, a * uAlpha);
}`;

/* ---------------- Mountains: shaded surface ---------------- */

export const terrainFillVS = (cell: number, octaves: number) => /* glsl */ `
attribute vec2 aGrid;
uniform mat4 uMatrix;
uniform float uTravel;
varying float vDepth;
varying float vHeight;
varying vec3 vNormal;
${NOISE}
${TERRAIN(octaves)}
${TERRAIN_POS(cell)}
void main() {
  vec3 p = terrainPoint(aGrid, uTravel);
  // Normal from finite differences of the height field.
  float e = 1.3;
  vec2 w = vec2(p.x, p.z - uTravel);
  float hL = terrain(w - vec2(e, 0.0));
  float hR = terrain(w + vec2(e, 0.0));
  float hD = terrain(w - vec2(0.0, e));
  float hU = terrain(w + vec2(0.0, e));
  vNormal = normalize(vec3(hL - hR, 2.0 * e, hD - hU));
  vDepth = aGrid.y;
  vHeight = p.y;
  gl_Position = uMatrix * vec4(p, 1.0);
}`;

export const TERRAIN_FILL_FS = /* glsl */ `
precision mediump float;
varying float vDepth;
varying float vHeight;
varying vec3 vNormal;
uniform float uAlpha;
uniform float uLight;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
void main() {
  vec3 n = normalize(vNormal);
  float diffuse = max(dot(n, uSunDir), 0.0);
  float sky = 0.5 + 0.5 * n.y;

  // Snow gathers on high, flat-ish ground.
  float snow = smoothstep(8.5, 13.5, vHeight) * smoothstep(0.45, 0.8, n.y);

  vec3 rockDark = mix(vec3(0.05, 0.07, 0.13), vec3(0.30, 0.33, 0.41), uLight);
  vec3 rockLit = mix(vec3(0.16, 0.20, 0.30), vec3(0.55, 0.58, 0.66), uLight);
  vec3 snowCol = mix(vec3(0.72, 0.80, 0.95), vec3(0.97, 0.98, 1.0), uLight);

  vec3 col = mix(rockDark, rockLit, diffuse * 0.75 + sky * 0.25);
  col = mix(col, snowCol * (0.55 + 0.45 * diffuse), snow);
  col += uSunColor * pow(diffuse, 6.0) * 0.35;

  // Aerial perspective: distant ridges wash out toward the sky.
  float haze = smoothstep(0.25, 1.0, vDepth);
  col = mix(col, mix(vec3(0.16, 0.19, 0.32), vec3(0.78, 0.83, 0.92), uLight), haze * 0.75);

  float fade = (1.0 - smoothstep(0.62, 1.0, vDepth)) * smoothstep(0.0, 0.05, vDepth);
  gl_FragColor = vec4(col, fade * uAlpha);
}`;

/* ---------------- Mountains: contour wireframe ---------------- */

export const terrainLineVS = (cell: number, octaves: number) => /* glsl */ `
attribute vec2 aGrid;
uniform mat4 uMatrix;
uniform float uTravel;
varying float vDepth;
varying float vHeight;
${NOISE}
${TERRAIN(octaves)}
${TERRAIN_POS(cell)}
void main() {
  vec3 p = terrainPoint(aGrid, uTravel);
  vDepth = aGrid.y;
  vHeight = p.y;
  gl_Position = uMatrix * vec4(p, 1.0);
}`;

export const TERRAIN_LINE_FS = /* glsl */ `
precision mediump float;
varying float vDepth;
varying float vHeight;
uniform float uAlpha;
uniform float uLight;
uniform float uPhase;
void main() {
  vec3 glacier = mix(vec3(0.37, 0.92, 0.83), vec3(0.55, 0.72, 1.0), uPhase);
  vec3 sky = mix(vec3(0.48, 0.64, 1.0), vec3(0.76, 0.56, 1.0), uPhase);
  vec3 violet = mix(vec3(0.69, 0.55, 1.0), vec3(1.0, 0.62, 0.58), uPhase);
  vec3 col = mix(glacier, sky, smoothstep(0.0, 0.45, vDepth));
  col = mix(col, violet, smoothstep(0.4, 0.9, vDepth));
  float fade = (1.0 - smoothstep(0.5, 1.0, vDepth)) * smoothstep(0.0, 0.06, vDepth);
  float a = fade * (0.10 + 0.4 * smoothstep(0.5, 13.0, vHeight));
  col = mix(col, col * vec3(0.35, 0.38, 0.55), uLight);
  gl_FragColor = vec4(col, a * uAlpha * mix(1.0, 0.7, uLight));
}`;

/* ---------------- Stars ---------------- */

export const STAR_VS = /* glsl */ `
attribute vec3 aStar;
uniform vec2 uShift;
uniform float uTime;
uniform float uDpr;
varying float vFade;
void main() {
  vFade = 0.45 + 0.55 * sin(uTime * (0.6 + aStar.z * 1.4) + aStar.z * 40.0);
  gl_Position = vec4(aStar.xy + uShift * (0.4 + aStar.z), 0.9985, 1.0);
  gl_PointSize = (1.0 + aStar.z * 1.8) * uDpr;
}`;

export const DOT_FS = /* glsl */ `
precision mediump float;
varying float vFade;
uniform float uAlpha;
uniform vec3 uColor;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = (1.0 - smoothstep(0.0, 0.5, d)) * vFade;
  gl_FragColor = vec4(uColor, a * uAlpha);
}`;

/* ---------------- Drifting snow ---------------- */

export const SNOW_VS = /* glsl */ `
attribute vec4 aP;
uniform mat4 uMatrix;
uniform float uTime;
uniform float uTravel;
uniform float uDpr;
varying float vFade;
void main() {
  float y = mod(aP.y - uTime * (0.6 + aP.w * 1.4), 34.0) - 2.0;
  float z = mod(aP.z + uTravel * 1.4, 110.0) - 104.0;
  float x = aP.x + sin(uTime * 0.5 + aP.w * 20.0) * 1.4;
  vec4 clip = uMatrix * vec4(x, y, z, 1.0);
  gl_Position = clip;
  float w = max(clip.w, 0.5);
  gl_PointSize = clamp(uDpr * (0.6 + aP.w) * 26.0 / w, 1.0, 9.0 * uDpr);
  vFade = smoothstep(1.0, 8.0, w) * (1.0 - smoothstep(55.0, 105.0, w)) * (0.35 + 0.65 * aP.w);
}`;

/* ---------------- Birds ---------------- */

/**
 * Each bird is four vertices (two wing strokes). `aBird.x` seeds its position,
 * `aBird.y` is the vertex role: -1 left tip, 0 body, 1 right tip.
 * They glide forward with the scroll-driven flight and flap continuously.
 */
export const BIRD_VS = /* glsl */ `
attribute vec2 aBird;
uniform mat4 uMatrix;
uniform float uTime;
uniform float uTravel;
uniform float uSpeed;
varying float vFade;
float hash(float n) { return fract(sin(n * 12.9898) * 43758.5453); }
void main() {
  float seed = aBird.x;
  float role = aBird.y;
  float flock = floor(seed / 6.0);

  float baseX = (hash(seed) - 0.5) * 60.0 + (hash(flock + 3.1) - 0.5) * 24.0;
  float baseY = 13.0 + hash(seed + 1.7) * 11.0;
  float span = 0.75 + hash(seed + 5.2) * 0.75;
  float phase = hash(seed + 9.4) * 6.28;

  float z = mod(hash(seed + 2.3) * 150.0 + uTravel * 1.25 + uTime * uSpeed, 150.0) - 142.0;
  float x = baseX + sin(uTime * 0.22 + phase) * 4.0;
  float y = baseY + sin(uTime * 0.45 + phase * 1.7) * 1.1;

  float flap = sin(uTime * 6.5 + phase * 3.0);
  vec3 pos = vec3(x, y, z);
  pos.x += role * span;
  pos.y += abs(role) * flap * 0.55 - abs(role) * 0.12;

  vec4 clip = uMatrix * vec4(pos, 1.0);
  gl_Position = clip;
  float w = max(clip.w, 0.5);
  vFade = smoothstep(2.0, 14.0, w) * (1.0 - smoothstep(70.0, 140.0, w));
}`;

export const BIRD_FS = /* glsl */ `
precision mediump float;
varying float vFade;
uniform float uAlpha;
uniform vec3 uColor;
void main() {
  gl_FragColor = vec4(uColor, vFade * uAlpha);
}`;
