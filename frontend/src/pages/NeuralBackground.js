import { useEffect } from "react";

// ── Global CSS inject ────────────────────────────────────────────────────────
export const YN_CSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0a0a0f; color: #e2e8f0; font-family: 'DM Sans', sans-serif; overflow-x: hidden; }

  .yn-cursor {
    width: 20px; height: 20px; border: 1.5px solid rgba(99,102,241,0.8);
    border-radius: 50%; position: fixed; pointer-events: none;
    transform: translate(-50%, -50%); transition: all 0.15s ease;
    z-index: 9999; mix-blend-mode: difference;
  }
  .yn-cursor-dot {
    width: 5px; height: 5px; background: #818cf8;
    border-radius: 50%; position: fixed; pointer-events: none;
    transform: translate(-50%, -50%); z-index: 9999;
    transition: transform 0.05s ease;
  }

  .yn-canvas {
    position: fixed; top: 0; left: 0;
    width: 100%; height: 100%; pointer-events: none; z-index: 0;
  }

  @keyframes yn-fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .yn-fade-in { animation: yn-fadeIn 0.6s ease forwards; }
`;

// Inject CSS once into document head
if (typeof document !== "undefined") {
  const existing = document.getElementById("yn-neural-css");
  if (!existing) {
    const style = document.createElement("style");
    style.id = "yn-neural-css";
    style.textContent = YN_CSS;
    document.head.appendChild(style);
  }
}

// ── Neural Canvas (animated dot-network background) ──────────────────────────
export function useNeuralCanvas(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animId;
    const dots = [];
    const COUNT = 80;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < COUNT; i++) {
      dots.push({
        x:  Math.random() * canvas.width,
        y:  Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r:  Math.random() * 2 + 1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // connections
      for (let i = 0; i < COUNT; i++) {
        for (let j = i + 1; j < COUNT; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99,102,241,${0.15 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.stroke();
          }
        }
      }

      // dots
      dots.forEach(d => {
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(129,140,248,0.6)";
        ctx.fill();

        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0 || d.x > canvas.width)  d.vx *= -1;
        if (d.y < 0 || d.y > canvas.height) d.vy *= -1;
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [canvasRef]);
}

// ── Torus Canvas (rotating ring shape) ──────────────────────────────────────
export function useTorusCanvas(canvasRef, mouseRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let angle = 0;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width  * 0.75;
      const cy = canvas.height * 0.4;
      const R  = 120;
      const r  = 45;
      const segments = 60;

      for (let i = 0; i < segments; i++) {
        const theta = (i / segments) * Math.PI * 2 + angle;
        for (let j = 0; j < 20; j++) {
          const phi = (j / 20) * Math.PI * 2;
          const x = (R + r * Math.cos(phi)) * Math.cos(theta) + cx;
          const y = (R + r * Math.cos(phi)) * Math.sin(theta) * 0.4 + cy + r * Math.sin(phi) * 0.6;
          const alpha = 0.05 + 0.1 * Math.abs(Math.sin(phi + angle));

          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(139,92,246,${alpha})`;
          ctx.fill();
        }
      }

      angle += 0.004;
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [canvasRef, mouseRef]);
}

// ── Flow Canvas (flowing wave lines) ────────────────────────────────────────
export function useFlowCanvas(canvasRef, mouseRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let t = 0;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mx = mouseRef?.current?.x ?? canvas.width  / 2;
      const my = mouseRef?.current?.y ?? canvas.height / 2;

      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        const alpha = 0.03 + i * 0.015;
        ctx.strokeStyle = `rgba(99,102,241,${alpha})`;
        ctx.lineWidth = 1;

        for (let x = 0; x <= canvas.width; x += 4) {
          const distX = (x - mx) / canvas.width;
          const distY = (my / canvas.height - 0.5);
          const y = canvas.height / 2
            + Math.sin(x * 0.008 + t + i * 0.8) * (60 + i * 15)
            + distY * 40
            + Math.sin(x * 0.003 + t * 0.5) * 20;

          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      t += 0.012;
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [canvasRef, mouseRef]);
}

// ── Cursor Hook (custom cursor tracking) ─────────────────────────────────────
export function useCursor(mouseRef, cursorRef, cursorDotRef) {
  useEffect(() => {
    const move = (e) => {
      if (mouseRef?.current) {
        mouseRef.current.x = e.clientX;
        mouseRef.current.y = e.clientY;
      }
      if (cursorRef?.current) {
        cursorRef.current.style.left = e.clientX + "px";
        cursorRef.current.style.top  = e.clientY + "px";
      }
      if (cursorDotRef?.current) {
        cursorDotRef.current.style.left = e.clientX + "px";
        cursorDotRef.current.style.top  = e.clientY + "px";
      }
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [mouseRef, cursorRef, cursorDotRef]);
}