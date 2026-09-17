"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { resolvedTheme, subscribeTheme } from "@/lib/theme";
import {
  BIRD_FS,
  BIRD_VS,
  DEPTH,
  DOT_FS,
  SKY_VS,
  SNOW_VS,
  STAR_VS,
  TERRAIN_FILL_FS,
  TERRAIN_LINE_FS,
  skyFS,
  terrainFillVS,
  terrainLineVS,
} from "./scene";

type Mat4 = Float32Array;

function perspective(fov: number, aspect: number, near: number, far: number): Mat4 {
  const f = 1 / Math.tan(fov / 2);
  const nf = 1 / (near - far);
  return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0]);
}

function multiply(a: Mat4, b: Mat4): Mat4 {
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
      out[c * 4 + r] = s;
    }
  return out;
}

/** View matrix for a camera at `pos` with pitch (x), yaw (y) and roll (z). */
function view(pos: [number, number, number], pitch: number, yaw: number, roll: number): Mat4 {
  const cp = Math.cos(-pitch), sp = Math.sin(-pitch);
  const cy = Math.cos(-yaw), sy = Math.sin(-yaw);
  const cr = Math.cos(-roll), sr = Math.sin(-roll);
  const rz = new Float32Array([cr, sr, 0, 0, -sr, cr, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  const rx = new Float32Array([1, 0, 0, 0, 0, cp, sp, 0, 0, -sp, cp, 0, 0, 0, 0, 1]);
  const ry = new Float32Array([cy, 0, -sy, 0, 0, 1, 0, 0, sy, 0, cy, 0, 0, 0, 0, 1]);
  const t = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -pos[0], -pos[1], -pos[2], 1]);
  return multiply(rz, multiply(rx, multiply(ry, t)));
}

function program(gl: WebGLRenderingContext, vs: string, fs: string) {
  const p = gl.createProgram();
  if (!p) throw new Error(gl.isContextLost() ? "WebGL context lost" : "createProgram failed");
  const shaders: WebGLShader[] = [];
  for (const [type, src] of [
    [gl.VERTEX_SHADER, vs],
    [gl.FRAGMENT_SHADER, fs],
  ] as const) {
    const s = gl.createShader(type);
    if (!s) throw new Error(gl.isContextLost() ? "WebGL context lost" : "createShader failed");
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader error");
    gl.attachShader(p, s);
    shaders.push(s);
  }
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? "link error");
  for (const s of shaders) {
    gl.detachShader(p, s);
    gl.deleteShader(s);
  }
  return p;
}

function buffer(gl: WebGLRenderingContext, data: Float32Array) {
  const b = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, b);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  return b;
}

/**
 * Fixed, full-screen WebGL scene behind every page: a scroll-driven flight through
 * a Himalayan valley — shaded snow-capped ridges, a sun that sinks as you scroll,
 * drifting clouds, falling snow, stars and a flock of birds.
 */
export function Background3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathname = usePathname();
  const targetAlpha = useRef(1);
  // Bumping this re-runs setup after the browser restores a lost context.
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    targetAlpha.current = pathname === "/" ? 1 : 0.72;
  }, [pathname]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let raf = 0;
    const gl = canvas.getContext("webgl", { antialias: true, alpha: true, depth: true, powerPreference: "low-power" });
    if (!gl || gl.isContextLost()) return;

    // The browser can drop the context (tab backgrounded, GPU reset) — rebuild when it returns.
    const onLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
    };
    const onRestored = () => setGeneration((g) => g + 1);
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    // Lighter scene on phones and touch devices.
    const compact = window.matchMedia("(max-width: 640px), (pointer: coarse)").matches;
    const COLS = compact ? 84 : 132;
    const ROWS = compact ? 64 : 96;
    const CELL = DEPTH / (ROWS - 1);
    const OCTAVES = compact ? 4 : 5;
    const SKY_OCTAVES = compact ? 3 : 5;
    const SNOW = compact ? 200 : 460;
    const STARS = compact ? 200 : 380;
    const BIRDS = compact ? 9 : 20;

    let sky: WebGLProgram, fill: WebGLProgram, lines: WebGLProgram, stars: WebGLProgram, snow: WebGLProgram, birds: WebGLProgram;
    try {
      sky = program(gl, SKY_VS, skyFS(SKY_OCTAVES));
      fill = program(gl, terrainFillVS(CELL, OCTAVES), TERRAIN_FILL_FS);
      lines = program(gl, terrainLineVS(CELL, OCTAVES), TERRAIN_LINE_FS);
      stars = program(gl, STAR_VS, DOT_FS);
      snow = program(gl, SNOW_VS, DOT_FS);
      birds = program(gl, BIRD_VS, BIRD_FS);
    } catch (err) {
      console.warn("[Background3D] WebGL unavailable:", err);
      return;
    }

    /* ---------- geometry ---------- */

    const skyBuf = buffer(gl, new Float32Array([-1, -1, 3, -1, -1, 3]));

    const verts = new Float32Array(COLS * ROWS * 2);
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        verts[(r * COLS + c) * 2] = c / (COLS - 1);
        verts[(r * COLS + c) * 2 + 1] = r / (ROWS - 1);
      }
    const gridBuf = buffer(gl, verts);

    const lineIdx: number[] = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS - 1; c++) lineIdx.push(r * COLS + c, r * COLS + c + 1);
    for (let c = 0; c < COLS; c += 3) for (let r = 0; r < ROWS - 1; r++) lineIdx.push(r * COLS + c, (r + 1) * COLS + c);
    const lineIdxBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lineIdxBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(lineIdx), gl.STATIC_DRAW);

    const triIdx = new Uint16Array((COLS - 1) * (ROWS - 1) * 6);
    let t = 0;
    for (let r = 0; r < ROWS - 1; r++)
      for (let c = 0; c < COLS - 1; c++) {
        const a = r * COLS + c;
        triIdx[t++] = a;
        triIdx[t++] = a + 1;
        triIdx[t++] = a + COLS;
        triIdx[t++] = a + 1;
        triIdx[t++] = a + COLS + 1;
        triIdx[t++] = a + COLS;
      }
    const triIdxBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triIdxBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triIdx, gl.STATIC_DRAW);

    const starData = new Float32Array(STARS * 3);
    for (let i = 0; i < STARS; i++) {
      starData[i * 3] = Math.random() * 2.2 - 1.1;
      starData[i * 3 + 1] = Math.random() * 1.2 - 0.1;
      starData[i * 3 + 2] = Math.random() ** 3;
    }
    const starBuf = buffer(gl, starData);

    const snowData = new Float32Array(SNOW * 4);
    for (let i = 0; i < SNOW; i++) {
      snowData[i * 4] = (Math.random() - 0.5) * 90;
      snowData[i * 4 + 1] = Math.random() * 34;
      snowData[i * 4 + 2] = Math.random() * 110;
      snowData[i * 4 + 3] = Math.random();
    }
    const snowBuf = buffer(gl, snowData);

    // Four vertices per bird: left tip → body, body → right tip.
    const birdData = new Float32Array(BIRDS * 4 * 2);
    for (let i = 0; i < BIRDS; i++) {
      const seed = i + 1;
      const roles = [-1, 0, 0, 1];
      for (let v = 0; v < 4; v++) {
        birdData[(i * 4 + v) * 2] = seed;
        birdData[(i * 4 + v) * 2 + 1] = roles[v];
      }
    }
    const birdBuf = buffer(gl, birdData);

    /* ---------- uniforms ---------- */

    const u = (p: WebGLProgram, n: string) => gl.getUniformLocation(p, n);
    const loc = {
      skyPos: gl.getAttribLocation(sky, "aPos"),
      skyRight: u(sky, "uRight"), skyUp: u(sky, "uUp"), skyFwd: u(sky, "uFwd"),
      skySun: u(sky, "uSunDir"), skySunCol: u(sky, "uSunColor"), skyCloudCol: u(sky, "uCloudColor"),
      skyTan: u(sky, "uTanFov"), skyAspect: u(sky, "uAspect"), skyAlpha: u(sky, "uAlpha"),
      skyLight: u(sky, "uLight"), skyDrift: u(sky, "uDrift"), skyTime: u(sky, "uTime"), skyCover: u(sky, "uCloudAmount"),

      fillGrid: gl.getAttribLocation(fill, "aGrid"),
      fillMatrix: u(fill, "uMatrix"), fillTravel: u(fill, "uTravel"), fillAlpha: u(fill, "uAlpha"),
      fillLight: u(fill, "uLight"), fillSun: u(fill, "uSunDir"), fillSunCol: u(fill, "uSunColor"),

      lineGrid: gl.getAttribLocation(lines, "aGrid"),
      lineMatrix: u(lines, "uMatrix"), lineTravel: u(lines, "uTravel"), lineAlpha: u(lines, "uAlpha"),
      lineLight: u(lines, "uLight"), linePhase: u(lines, "uPhase"),

      star: gl.getAttribLocation(stars, "aStar"),
      starShift: u(stars, "uShift"), starTime: u(stars, "uTime"), starDpr: u(stars, "uDpr"),
      starAlpha: u(stars, "uAlpha"), starColor: u(stars, "uColor"),

      flake: gl.getAttribLocation(snow, "aP"),
      snowMatrix: u(snow, "uMatrix"), snowTime: u(snow, "uTime"), snowTravel: u(snow, "uTravel"),
      snowDpr: u(snow, "uDpr"), snowAlpha: u(snow, "uAlpha"), snowColor: u(snow, "uColor"),

      bird: gl.getAttribLocation(birds, "aBird"),
      birdMatrix: u(birds, "uMatrix"), birdTime: u(birds, "uTime"), birdTravel: u(birds, "uTravel"),
      birdSpeed: u(birds, "uSpeed"), birdAlpha: u(birds, "uAlpha"), birdColor: u(birds, "uColor"),
    };

    gl.enable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clearColor(0, 0, 0, 0);

    const dpr = Math.min(window.devicePixelRatio || 1, compact ? 1.25 : 1.5);
    const resize = () => {
      const w = Math.floor(canvas.clientWidth * dpr);
      const h = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mouse.x = e.clientX / window.innerWidth - 0.5;
      mouse.y = e.clientY / window.innerHeight - 0.5;
    };
    if (!reduced) window.addEventListener("pointermove", onMove, { passive: true });

    let lightTarget = resolvedTheme() === "light" ? 1 : 0;
    let light = lightTarget;
    const unsubscribeTheme = subscribeTheme(() => {
      lightTarget = resolvedTheme() === "light" ? 1 : 0;
    });

    let alpha = 0;
    let progress = 0;
    let last = performance.now();
    let drift = 0; // time-based forward motion
    let flightTarget = 0; // scroll-based forward motion
    let flight = 0;
    let lastScroll = window.scrollY;
    let birdBoost = 0;

    const draw = (now: number) => {
      // Time-based easing so slow devices still animate smoothly.
      const rawDt = Math.min(1, (now - last) / 1000);
      last = now;
      const time = reduced ? 0 : now / 1000;
      const ease = (rate: number) => 1 - Math.exp(-rawDt * rate);

      // Scroll drives the flight: every pixel scrolled moves the camera up the valley.
      const y = window.scrollY;
      const delta = Math.max(-240, Math.min(240, y - lastScroll));
      lastScroll = y;
      if (!reduced) {
        drift += Math.min(0.05, rawDt) * 5;
        flightTarget += delta * 0.06;
      }
      flight += (flightTarget - flight) * ease(5);
      const travel = drift + flight;
      // Birds surge forward while the page is moving.
      birdBoost += (Math.min(6, Math.abs(delta) * 0.25) - birdBoost) * ease(3);

      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      progress += (Math.min(1, y / max) - progress) * ease(4);
      mouse.sx += (mouse.x - mouse.sx) * ease(2.5);
      mouse.sy += (mouse.y - mouse.sy) * ease(2.5);
      alpha += (targetAlpha.current - alpha) * ease(2.2);
      light += (lightTarget - light) * ease(6);

      const arc = Math.sin(progress * Math.PI);
      const sway = compact ? Math.sin(time * 0.25) * 0.04 : 0;
      const camY = 7 + arc * 7 + progress * 2;
      const pitch = -0.08 - arc * 0.2 - mouse.sy * 0.06;
      const yaw = Math.sin(progress * Math.PI * 2) * 0.26 + mouse.sx * 0.18 + sway;
      const roll = -Math.sin(progress * Math.PI * 2) * 0.05 - mouse.sx * 0.02;
      const aspect = canvas.width / canvas.height;
      const fov = aspect < 1 ? 1.3 : 1.0;
      const v = view([0, camY, 6], pitch, yaw, roll);
      const m = multiply(perspective(fov, aspect, 0.1, 400), v);

      // Camera basis in world space, for the sky's ray directions.
      const right: [number, number, number] = [v[0], v[4], v[8]];
      const up: [number, number, number] = [v[1], v[5], v[9]];
      const fwd: [number, number, number] = [-v[2], -v[6], -v[10]];

      // The sun sinks and warms as the page scrolls.
      const elev = 0.34 - progress * 0.36;
      const azim = -0.45 + progress * 0.7;
      const sun: [number, number, number] = [
        Math.sin(azim) * Math.cos(elev),
        Math.sin(elev),
        -Math.cos(azim) * Math.cos(elev),
      ];
      const warm = Math.min(1, Math.max(0, progress * 1.3));
      const sunCol: [number, number, number] = light > 0.5
        ? [1.0, 0.93 - warm * 0.18, 0.78 - warm * 0.3]
        : [1.0, 0.72 - warm * 0.16, 0.45 - warm * 0.12];

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      const ink = light > 0.5;
      const additive = () => gl.blendFuncSeparate(gl.SRC_ALPHA, ink ? gl.ONE_MINUS_SRC_ALPHA : gl.ONE, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      const normal = () => gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      // 1. Stars (behind the clouds, dark theme only)
      if (light < 0.99) {
        gl.depthMask(false);
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE);
        gl.useProgram(stars);
        gl.bindBuffer(gl.ARRAY_BUFFER, starBuf);
        gl.enableVertexAttribArray(loc.star);
        gl.vertexAttribPointer(loc.star, 3, gl.FLOAT, false, 0, 0);
        gl.uniform2f(loc.starShift, -mouse.sx * 0.05 - yaw * 0.3, mouse.sy * 0.05 + arc * 0.3);
        gl.uniform1f(loc.starTime, time);
        gl.uniform1f(loc.starDpr, dpr);
        gl.uniform1f(loc.starAlpha, alpha * 0.9 * (1 - light));
        gl.uniform3f(loc.starColor, 0.85, 0.9, 1.0);
        gl.drawArrays(gl.POINTS, 0, STARS);
        gl.disableVertexAttribArray(loc.star);
      }

      // 2. Sky: sun, glow and clouds
      gl.depthMask(false);
      normal();
      gl.useProgram(sky);
      gl.bindBuffer(gl.ARRAY_BUFFER, skyBuf);
      gl.enableVertexAttribArray(loc.skyPos);
      gl.vertexAttribPointer(loc.skyPos, 2, gl.FLOAT, false, 0, 0);
      gl.uniform3fv(loc.skyRight, right);
      gl.uniform3fv(loc.skyUp, up);
      gl.uniform3fv(loc.skyFwd, fwd);
      gl.uniform3fv(loc.skySun, sun);
      gl.uniform3fv(loc.skySunCol, sunCol);
      if (ink) gl.uniform3f(loc.skyCloudCol, 0.93, 0.95, 1.0);
      else gl.uniform3f(loc.skyCloudCol, 0.42, 0.45, 0.62);
      gl.uniform1f(loc.skyTan, Math.tan(fov / 2));
      gl.uniform1f(loc.skyAspect, aspect);
      gl.uniform1f(loc.skyAlpha, alpha * (ink ? 0.85 : 0.7));
      gl.uniform1f(loc.skyLight, light);
      gl.uniform1f(loc.skyDrift, progress * 2.4 + travel * 0.004);
      gl.uniform1f(loc.skyTime, time);
      gl.uniform1f(loc.skyCover, 0.08 + arc * 0.28);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.disableVertexAttribArray(loc.skyPos);

      // 3. Mountains: shaded surface (writes depth so birds and snow can hide behind ridges)
      gl.depthMask(true);
      normal();
      gl.enable(gl.POLYGON_OFFSET_FILL);
      gl.polygonOffset(1, 1);
      gl.useProgram(fill);
      gl.bindBuffer(gl.ARRAY_BUFFER, gridBuf);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triIdxBuf);
      gl.enableVertexAttribArray(loc.fillGrid);
      gl.vertexAttribPointer(loc.fillGrid, 2, gl.FLOAT, false, 0, 0);
      gl.uniformMatrix4fv(loc.fillMatrix, false, m);
      gl.uniform1f(loc.fillTravel, travel);
      gl.uniform1f(loc.fillAlpha, alpha * (ink ? 0.5 : 0.82));
      gl.uniform1f(loc.fillLight, light);
      gl.uniform3fv(loc.fillSun, sun);
      gl.uniform3fv(loc.fillSunCol, sunCol);
      gl.drawElements(gl.TRIANGLES, triIdx.length, gl.UNSIGNED_SHORT, 0);
      gl.disableVertexAttribArray(loc.fillGrid);
      gl.disable(gl.POLYGON_OFFSET_FILL);

      // 4. Contour lines over the surface
      gl.depthMask(false);
      additive();
      gl.useProgram(lines);
      gl.bindBuffer(gl.ARRAY_BUFFER, gridBuf);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lineIdxBuf);
      gl.enableVertexAttribArray(loc.lineGrid);
      gl.vertexAttribPointer(loc.lineGrid, 2, gl.FLOAT, false, 0, 0);
      gl.uniformMatrix4fv(loc.lineMatrix, false, m);
      gl.uniform1f(loc.lineTravel, travel);
      gl.uniform1f(loc.lineAlpha, alpha * 0.85);
      gl.uniform1f(loc.lineLight, light);
      gl.uniform1f(loc.linePhase, progress);
      gl.drawElements(gl.LINES, lineIdx.length, gl.UNSIGNED_SHORT, 0);
      gl.disableVertexAttribArray(loc.lineGrid);

      // 5. Birds
      gl.useProgram(birds);
      normal();
      gl.bindBuffer(gl.ARRAY_BUFFER, birdBuf);
      gl.enableVertexAttribArray(loc.bird);
      gl.vertexAttribPointer(loc.bird, 2, gl.FLOAT, false, 0, 0);
      gl.uniformMatrix4fv(loc.birdMatrix, false, m);
      gl.uniform1f(loc.birdTime, time);
      gl.uniform1f(loc.birdTravel, travel);
      gl.uniform1f(loc.birdSpeed, 2.2 + birdBoost);
      gl.uniform1f(loc.birdAlpha, alpha * (ink ? 0.75 : 0.6));
      if (ink) gl.uniform3f(loc.birdColor, 0.12, 0.15, 0.24);
      else gl.uniform3f(loc.birdColor, 0.88, 0.91, 1.0);
      gl.drawArrays(gl.LINES, 0, BIRDS * 4);
      gl.disableVertexAttribArray(loc.bird);

      // 6. Snow
      additive();
      gl.useProgram(snow);
      gl.bindBuffer(gl.ARRAY_BUFFER, snowBuf);
      gl.enableVertexAttribArray(loc.flake);
      gl.vertexAttribPointer(loc.flake, 4, gl.FLOAT, false, 0, 0);
      gl.uniformMatrix4fv(loc.snowMatrix, false, m);
      gl.uniform1f(loc.snowTime, time);
      gl.uniform1f(loc.snowTravel, travel);
      gl.uniform1f(loc.snowDpr, dpr);
      gl.uniform1f(loc.snowAlpha, alpha * (ink ? 0.4 : 0.75));
      if (ink) gl.uniform3f(loc.snowColor, 0.3, 0.36, 0.55);
      else gl.uniform3f(loc.snowColor, 0.9, 0.94, 1.0);
      gl.drawArrays(gl.POINTS, 0, SNOW);
      gl.disableVertexAttribArray(loc.flake);

      raf = requestAnimationFrame(draw);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      raf = requestAnimationFrame(draw);
    };
    const onVisibility = () => (document.hidden ? cancelAnimationFrame(raf) : start());
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      cancelAnimationFrame(raf);
      unsubscribeTheme();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      // Free GPU resources but keep the context: losing it here would leave the
      // canvas dead when React re-runs this effect (Strict Mode, Fast Refresh).
      for (const b of [skyBuf, gridBuf, lineIdxBuf, triIdxBuf, starBuf, snowBuf, birdBuf]) gl.deleteBuffer(b);
      for (const p of [sky, fill, lines, stars, snow, birds]) gl.deleteProgram(p);
    };
  }, [generation]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Slowly drifting aurora glows behind the scene */}
      <div className="aurora-blob aurora-blob-1" />
      <div className="aurora-blob aurora-blob-2" />
      <div className="aurora-blob aurora-blob-3" />
      <div className="absolute inset-x-0 bottom-0 h-[70vh] glow-horizon" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {/* Keep text readable further down the page */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-night/10 to-night/50" />
    </div>
  );
}
