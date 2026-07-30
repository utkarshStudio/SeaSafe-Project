"use client";

import { useEffect, useRef } from "react";

interface Bubble {
  x: number; y: number; r: number;
  speed: number; opacity: number; wobble: number;
}

interface Sparkle {
  x: number; y: number;
  maxOp: number; phase: number; speed: number;
}

export function LandingBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let W = 0, H = 0, t = 0;
    let bubbles: Bubble[] = [];
    let sparkles: Sparkle[] = [];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ----- Wave function (multi-sine) -----
    const wavePx = (x: number, time: number) =>
      H * 0.38
      + Math.sin(x * 0.005  + time * 0.50) * 16
      + Math.sin(x * 0.011  - time * 0.32) * 10
      + Math.sin(x * 0.0028 + time * 0.70) * 22;

    const init = () => {
      bubbles = Array.from({ length: 65 }, () => ({
        x: Math.random() * W,
        y: H * 0.42 + Math.random() * H * 0.58,
        r: 0.6 + Math.random() * 3.2,
        speed: 0.2 + Math.random() * 0.65,
        opacity: 0.07 + Math.random() * 0.25,
        wobble: Math.random() * Math.PI * 2,
      }));
      sparkles = Array.from({ length: 45 }, () => ({
        x: Math.random() * W,
        y: H * 0.78 + Math.random() * H * 0.22,
        maxOp: 0.2 + Math.random() * 0.55,
        phase: Math.random() * Math.PI * 2,
        speed: 0.008 + Math.random() * 0.024,
      }));
    };

    // ----- Layers -----
    const drawBase = () => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0,    "#010b16");  // near-black top (night sky)
      g.addColorStop(0.22, "#021728"); // dark navy
      g.addColorStop(0.40, "#03202e"); // dark teal-navy (wave zone)
      g.addColorStop(0.55, "#042535"); // teal deep
      g.addColorStop(0.72, "#031a26"); // mid deep
      g.addColorStop(0.88, "#020f1c"); // abyss
      g.addColorStop(1,    "#010810"); // ocean floor
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    };

    // Caustic light patterns (rippling bright patches under water)
    const drawCaustics = (wy: number, time: number) => {
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.04;
      for (let i = 0; i < 6; i++) {
        const cx = W * (0.1 + i * 0.16) + Math.sin(time * 0.18 + i * 1.3) * 60;
        const cy = wy + 80 + Math.sin(time * 0.22 + i * 0.9) * 40 + i * (H * 0.08);
        const rx = 120 + Math.sin(time * 0.15 + i) * 40;
        const ry = 35  + Math.sin(time * 0.19 + i * 1.1) * 12;
        const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
        gr.addColorStop(0,   "rgba(0, 230, 220, 0.9)");
        gr.addColorStop(0.5, "rgba(0, 160, 185, 0.4)");
        gr.addColorStop(1,   "transparent");
        ctx.fillStyle = gr;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    // God rays — wide volumetric beams below wave
    const drawGodRays = (wy: number, time: number) => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, wy - 10, W, H);
      ctx.clip();

      const numRays = 7;
      const cx = W * 0.5;
      for (let i = 0; i < numRays; i++) {
        const frac = i / (numRays - 1);
        const spread = 0.65;
        const angle = -Math.PI / 2 + (frac - 0.5) * Math.PI * spread;
        const len = H * 0.78;
        const bx  = cx + (frac - 0.5) * W * 0.55;
        const ex  = bx + Math.sin(angle) * len;
        const ey  = wy + Math.abs(Math.cos(angle)) * len;
        const pulse = 0.5 + 0.5 * Math.sin(time * 0.22 + i * 1.1);
        const alpha = 0.008 + 0.022 * pulse;

        const rg = ctx.createLinearGradient(bx, wy, ex, ey);
        rg.addColorStop(0,    `rgba(0, 215, 225, ${alpha * 3})`);
        rg.addColorStop(0.2,  `rgba(0, 165, 185, ${alpha * 1.8})`);
        rg.addColorStop(0.55, `rgba(0, 100, 130, ${alpha * 0.8})`);
        rg.addColorStop(1,    "rgba(0, 40, 70, 0)");

        const hw = 20 + frac * 18;
        ctx.beginPath();
        ctx.moveTo(bx - hw * 0.3, wy);
        ctx.lineTo(bx + hw * 0.3, wy);
        ctx.lineTo(ex + hw * 2.2, ey);
        ctx.lineTo(ex - hw * 2.2, ey);
        ctx.closePath();
        ctx.fillStyle = rg;
        ctx.fill();
      }
      ctx.restore();
    };

    // Diffuse underwater glow
    const drawUnderwaterGlow = (wy: number) => {
      const rg = ctx.createRadialGradient(W / 2, wy + 10, 0, W / 2, wy + 60, W * 0.7);
      rg.addColorStop(0,    "rgba(0, 200, 215, 0.14)");
      rg.addColorStop(0.28, "rgba(0, 130, 155, 0.07)");
      rg.addColorStop(0.62, "rgba(0, 70,  110, 0.03)");
      rg.addColorStop(1,    "rgba(0, 0,   0,   0)");
      ctx.fillStyle = rg;
      ctx.fillRect(0, wy, W, H - wy);
    };

    // Ocean surface — dark water above, foam at break, chop below
    const drawSurface = (time: number) => {
      // Fill above with dark storm-ocean color
      ctx.beginPath();
      ctx.moveTo(0, 0);
      for (let x = 0; x <= W; x += 4) {
        const y = wavePx(x, time);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.lineTo(W, 0);
      ctx.closePath();
      const sg = ctx.createLinearGradient(0, H * 0.14, 0, H * 0.42);
      sg.addColorStop(0,   "#010c1a");
      sg.addColorStop(0.6, "#021628");
      sg.addColorStop(1,   "#031e32");
      ctx.fillStyle = sg;
      ctx.fill();

      // Primary foam crest
      ctx.beginPath();
      for (let x = 0; x <= W; x += 3) {
        const y = wavePx(x, time);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      const fc = ctx.createLinearGradient(0, H * 0.33, 0, H * 0.43);
      fc.addColorStop(0,   "rgba(210, 250, 255, 0.72)");
      fc.addColorStop(0.45,"rgba(90,  210, 235, 0.32)");
      fc.addColorStop(1,   "rgba(0, 110, 155, 0)");
      ctx.strokeStyle = fc;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Secondary chop
      ctx.beginPath();
      for (let x = 0; x <= W; x += 5) {
        const y = wavePx(x, time) + Math.sin(x * 0.022 + time * 1.9) * 5 + 9;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(130, 225, 245, 0.13)";
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Foam scatter
      for (let i = 0; i < 32; i++) {
        const fx = ((i / 32) * W + Math.sin(time * 0.4 + i) * 25 + W) % W;
        const fy = wavePx(fx, time) + Math.sin(time * 1.3 + i * 0.7) * 5;
        const fa = 0.08 + 0.28 * Math.abs(Math.sin(time * 0.85 + i));
        ctx.beginPath();
        ctx.arc(fx, fy, 1 + Math.random() * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(215, 250, 255, ${fa})`;
        ctx.fill();
      }
    };

    const drawBubbles = (time: number) => {
      bubbles.forEach((b, idx) => {
        const wy = wavePx(b.x, time);
        if (!reduced) {
          b.y -= b.speed;
          b.wobble += 0.025;
          if (b.y < wy - 4) {
            bubbles[idx] = { ...b, y: H * 0.8 + Math.random() * H * 0.2, x: Math.random() * W };
            return;
          }
        }
        const wx = b.x + Math.sin(b.wobble) * 1.6;
        const bg = ctx.createRadialGradient(wx - b.r * 0.3, b.y - b.r * 0.3, 0, wx, b.y, b.r);
        bg.addColorStop(0,   `rgba(195, 248, 255, ${b.opacity * 0.5})`);
        bg.addColorStop(0.7, `rgba(55, 175, 205, ${b.opacity * 0.1})`);
        bg.addColorStop(1,   `rgba(0, 140, 175, ${b.opacity * 0.3})`);
        ctx.beginPath();
        ctx.arc(wx, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = bg;
        ctx.fill();
        ctx.strokeStyle = `rgba(140, 228, 248, ${b.opacity * 0.5})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });
    };

    const drawFloor = () => {
      const fy = H * 0.8;
      const fg = ctx.createLinearGradient(0, fy, 0, H);
      fg.addColorStop(0,    "rgba(1,8,18,0)");
      fg.addColorStop(0.3,  "rgba(1,9,20,0.5)");
      fg.addColorStop(1,    "rgba(1,5,12,0.97)");
      ctx.fillStyle = fg;
      ctx.fillRect(0, fy, W, H - fy);

      sparkles.forEach(s => {
        if (!reduced) s.phase += s.speed;
        const op = s.maxOp * (0.5 + 0.5 * Math.sin(s.phase));
        const sg = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 10);
        sg.addColorStop(0,   `rgba(0, 215, 230, ${op})`);
        sg.addColorStop(0.5, `rgba(0, 160, 185, ${op * 0.35})`);
        sg.addColorStop(1,   "transparent");
        ctx.fillStyle = sg;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 10, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    // ----- Render loop -----
    const render = () => {
      if (!reduced) t += 0.01;
      ctx.clearRect(0, 0, W, H);
      const wy = wavePx(W / 2, t);
      drawBase();
      drawGodRays(wy, t);
      drawCaustics(wy, t);
      drawUnderwaterGlow(wy);
      drawFloor();
      drawBubbles(t);
      drawSurface(t);
      animId = requestAnimationFrame(render);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      ctx.scale(dpr, dpr);
      init();
    };

    resize();
    window.addEventListener("resize", resize);
    render();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" aria-hidden="true" />;
}
