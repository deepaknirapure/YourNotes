import { useEffect } from "react";

// ── THEME TOKENS ─────────────────────────────────────────────────────────────
export const THEME = {
  green:       "#10B981",
  greenDeep:   "#059669",
  greenDark:   "#064e3b",
  greenGlow:   "rgba(16,185,129,0.25)",
  black:       "#000000",
  darkBg:      "#050f0a",
  dark:        "#0a1a0f",
  white:       "#ffffff",
  offWhite:    "#f0fff8",
  textMuted:   "rgba(240,255,248,0.45)",
  border:      "rgba(16,185,129,0.15)",
  fontDisplay: "'Syne', sans-serif",
  fontBody:    "'DM Sans', sans-serif",
};

// ── Global CSS inject ────────────────────────────────────────────────────────
export const YN_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,800&family=Syne:wght@700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #050f0a; color: #f0fff8; font-family: 'DM Sans', sans-serif; overflow-x: hidden; }

  :root {
    --yn-green:      #10B981;
    --yn-green-deep: #059669;
    --yn-green-glow: rgba(16,185,129,0.25);
    --yn-dark:       #050f0a;
    --yn-white:      #ffffff;
    --yn-text-muted: rgba(240,255,248,0.45);
    --yn-border:     rgba(16,185,129,0.15);
  }

  .yn-cursor-ring {
    width: 22px; height: 22px;
    border: 1.5px solid rgba(16,185,129,0.7);
    border-radius: 50%; position: fixed; pointer-events: none;
    transform: translate(-50%, -50%);
    transition: all 0.15s ease; z-index: 9999;
    mix-blend-mode: screen;
  }
  .yn-cursor-dot {
    width: 5px; height: 5px; background: #10B981;
    border-radius: 50%; position: fixed; pointer-events: none;
    transform: translate(-50%, -50%); z-index: 9999;
    transition: transform 0.05s ease;
    box-shadow: 0 0 8px #10B981;
  }

  .yn-canvas {
    position: fixed; top: 0; left: 0;
    width: 100%; height: 100%; pointer-events: none; z-index: 0;
  }

  /* ── Logo wordmark ── */
  .yn-wordmark {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 18px;
    color: #ffffff;
    letter-spacing: -0.5px;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
  }
  .yn-wordmark span { color: #10B981; }

  /* ── Nav logo (smaller) ── */
  .yn-nav-logo {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 15px;
    color: #ffffff;
    letter-spacing: 1px;
    text-decoration: none;
  }
  .yn-nav-logo em { color: #10B981; font-style: normal; }

  /* ── Buttons ── */
  .yn-btn-primary {
    background: #10B981; color: #fff; border: none;
    padding: 12px 28px; border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 700;
    cursor: pointer; transition: all .2s;
    text-decoration: none; display: inline-block;
    letter-spacing: -.2px;
  }
  .yn-btn-primary:hover {
    background: #059669;
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(16,185,129,.35);
  }

  .yn-btn-outline {
    background: transparent; color: rgba(240,255,248,0.7);
    border: 1px solid rgba(16,185,129,.3);
    padding: 12px 24px; border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all .2s;
    text-decoration: none; display: inline-block;
  }
  .yn-btn-outline:hover {
    border-color: #10B981; color: #10B981;
    background: rgba(16,185,129,.05);
  }

  /* ── Card ── */
  .yn-card {
    background: rgba(16,185,129,.04);
    border: 1px solid rgba(16,185,129,.15);
    border-radius: 20px;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  /* ── Input ── */
  .yn-input {
    width: 100%; padding: 14px 16px;
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(16,185,129,.2);
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; color: #f0fff8;
    outline: none; transition: border .15s;
    box-sizing: border-box;
  }
  .yn-input::placeholder { color: rgba(240,255,248,.25); }
  .yn-input:focus { border-color: #10B981; box-shadow: 0 0 0 3px rgba(16,185,129,.08); }

  /* ── Animations ── */
  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes fadeUp  { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:none; } }
  @keyframes pulse   { 0%,100% { opacity:1; } 50% { opacity:.5; } }
`;

// Inject CSS once
if (typeof document !== "undefined") {
  const existing = document.getElementById("yn-neural-css");
  if (!existing) {
    const style = document.createElement("style");
    style.id = "yn-neural-css";
    style.textContent = YN_CSS;
    document.head.appendChild(style);
  }
}

// ── Neural Canvas – green-tinted dot network ─────────────────────────────────
export function useNeuralCanvas(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    const COUNT = 70;
    const dots  = [];

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
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r:  Math.random() * 1.8 + 0.8,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < COUNT; i++) {
        for (let j = i + 1; j < COUNT; j++) {
          const dx   = dots[i].x - dots[j].x;
          const dy   = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(16,185,129,${0.12 * (1 - dist / 140)})`;
            ctx.lineWidth = 0.7;
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.stroke();
          }
        }
      }

      dots.forEach(d => {
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(16,185,129,0.55)";
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

// ── Cursor Hook ───────────────────────────────────────────────────────────────
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

// Legacy exports (kept for compatibility)
export function useTorusCanvas() {}
export function useFlowCanvas()  {}