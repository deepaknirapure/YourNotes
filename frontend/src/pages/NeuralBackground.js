import { useEffect, useRef } from "react";

// ─── Shared CSS injected once ───────────────────────────────────────────────
export const YN_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=JetBrains+Mono:wght@400;500;600&display=swap');
  :root {
    --yn-cyan:   #00e5ff;
    --yn-purple: #8b5cf6;
    --yn-amber:  #f59e0b;
    --yn-bg:     #03030f;
    --yn-text:   #f0f0ff;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { cursor: none; overflow-x: hidden; background: var(--yn-bg); color: var(--yn-text); font-family: 'DM Sans', sans-serif; }
  input:focus, textarea:focus { outline: none; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #03030f; }
  ::-webkit-scrollbar-thumb { background: rgba(0,229,255,.22); border-radius: 3px; }
  @keyframes blink    { 0%,100%{opacity:1} 50%{opacity:.3} }
  @keyframes fadeUp   { from{opacity:0;transform:translateY(26px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeLeft { from{opacity:0;transform:translateX(26px)} to{opacity:1;transform:translateX(0)} }
  @keyframes spin     { to{transform:rotate(360deg)} }
  @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.5} }
  @media (max-width: 860px) { body { cursor: auto !important; } }

  .yn-field {
    width: 100%;
    padding: 12px 16px;
    background: rgba(255,255,255,0.05);
    border: 1.5px solid rgba(0,229,255,0.14);
    border-radius: 10px;
    font-size: 14px;
    color: #f0f0ff;
    font-family: 'DM Sans', sans-serif;
    transition: border-color .2s, box-shadow .2s;
  }
  .yn-field:focus { border-color: var(--yn-cyan); box-shadow: 0 0 0 3px rgba(0,229,255,0.1); }
  .yn-field::placeholder { color: rgba(240,240,255,0.3); }
  .yn-field option { background: #0a0a1f; color: #f0f0ff; }

  .yn-btn-primary {
    background: var(--yn-cyan);
    color: #000;
    border: none;
    padding: 12px 28px;
    border-radius: 100px;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: .85rem;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
    transition: box-shadow .3s, transform .2s;
    letter-spacing: .5px;
  }
  .yn-btn-primary:hover { box-shadow: 0 0 30px rgba(0,229,255,0.5); transform: translateY(-1px); }
  .yn-btn-primary:disabled { opacity: .5; cursor: not-allowed; transform: none; }

  .yn-btn-ghost {
    background: transparent;
    color: rgba(240,240,255,0.7);
    border: 1px solid rgba(0,229,255,0.18);
    padding: 12px 28px;
    border-radius: 100px;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: .85rem;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
    transition: border-color .2s, color .2s;
  }
  .yn-btn-ghost:hover { border-color: var(--yn-cyan); color: #f0f0ff; }

  .yn-card {
    background: rgba(255,255,255,0.035);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .yn-cursor-ring {
    position: fixed; width: 34px; height: 34px;
    border: 1.5px solid var(--yn-cyan); border-radius: 50%;
    pointer-events: none; z-index: 9999;
    transform: translate(-50%,-50%);
    box-shadow: 0 0 14px rgba(0,229,255,0.4);
    transition: width .25s, height .25s;
  }
  .yn-cursor-dot {
    position: fixed; width: 5px; height: 5px;
    background: var(--yn-cyan); border-radius: 50%;
    pointer-events: none; z-index: 9999;
    transform: translate(-50%,-50%);
    box-shadow: 0 0 8px var(--yn-cyan);
  }
  .yn-canvas {
    position: fixed; inset: 0;
    width: 100%; height: 100%;
  }
  .yn-nav {
    position: fixed; top: 18px; left: 50%;
    transform: translateX(-50%);
    width: min(94%, 1100px);
    z-index: 200;
    background: rgba(3,3,15,0.65);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(0,229,255,0.14);
    border-radius: 100px;
    padding: 13px 26px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }
  .yn-nav-logo {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    letter-spacing: 3px;
    color: var(--yn-cyan);
    text-shadow: 0 0 18px rgba(0,229,255,0.5);
    text-decoration: none;
  }
  .yn-nav-link {
    text-decoration: none;
    font-size: .83rem;
    color: rgba(240,240,255,.5);
    font-weight: 500;
    transition: color .2s;
  }
  .yn-nav-link:hover { color: var(--yn-cyan); }
  .yn-sLabel {
    font-family: 'JetBrains Mono', monospace;
    font-size: .68rem;
    letter-spacing: 3.5px;
    color: var(--yn-cyan);
    text-transform: uppercase;
    margin-bottom: 14px;
  }
  .yn-error {
    background: rgba(239,68,68,.1);
    border: 1px solid rgba(239,68,68,.3);
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 13px;
    color: #f87171;
    margin-bottom: 16px;
  }
  .yn-success {
    background: rgba(0,229,255,.07);
    border: 1px solid rgba(0,229,255,.2);
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 13px;
    color: var(--yn-cyan);
    margin-bottom: 16px;
  }
`;

// ─── Neural Canvas ───────────────────────────────────────────────────────────
export function useNeuralCanvas(canvasRef) {
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const cx = cv.getContext("2d");
    let animId, dots = [];
    const resize = () => { cv.width = window.innerWidth; cv.height = window.innerHeight; };
    const init = () => {
      dots = Array.from({ length: window.innerWidth < 768 ? 40 : 70 }, () => ({
        x: Math.random() * cv.width, y: Math.random() * cv.height,
        vx: (Math.random() - .5) * .38, vy: (Math.random() - .5) * .38,
        r: Math.random() * 1.4 + .5,
      }));
    };
    const draw = () => {
      cx.clearRect(0, 0, cv.width, cv.height);
      const bg = cx.createRadialGradient(cv.width/2,cv.height/2,0,cv.width/2,cv.height/2,cv.width*.8);
      bg.addColorStop(0, "#07071a"); bg.addColorStop(1, "#000008");
      cx.fillStyle = bg; cx.fillRect(0, 0, cv.width, cv.height);
      dots.forEach((d, i) => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > cv.width)  d.vx *= -1;
        if (d.y < 0 || d.y > cv.height) d.vy *= -1;
        cx.beginPath(); cx.arc(d.x, d.y, d.r, 0, Math.PI*2);
        cx.fillStyle = "rgba(0,229,255,0.6)"; cx.fill();
        for (let j = i+1; j < dots.length; j++) {
          const d2 = dots[j], dist = Math.hypot(d.x-d2.x, d.y-d2.y);
          if (dist < 140) {
            cx.beginPath(); cx.moveTo(d.x,d.y); cx.lineTo(d2.x,d2.y);
            cx.strokeStyle = `rgba(0,229,255,${0.12*(1-dist/140)})`; cx.lineWidth=.6; cx.stroke();
          }
        }
      });
      animId = requestAnimationFrame(draw);
    };
    resize(); init(); draw();
    window.addEventListener("resize", () => { resize(); init(); });
    return () => { cancelAnimationFrame(animId); };
  }, [canvasRef]);
}

// ─── Torus Canvas ────────────────────────────────────────────────────────────
export function useTorusCanvas(canvasRef, mouseRef) {
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const cx = cv.getContext("2d");
    let animId, t = 0;
    const resize = () => { cv.width = window.innerWidth; cv.height = window.innerHeight; };
    const draw = () => {
      cx.fillStyle = "rgba(0,0,8,0.12)";
      cx.fillRect(0, 0, cv.width, cv.height);
      const W = cv.width, H = cv.height, layers = 6;
      for (let j = 0; j < layers; j++) {
        cx.beginPath();
        const hue = 175 + Math.sin(t + j*.7) * 55;
        cx.strokeStyle = `hsla(${hue},100%,55%,${0.08 + j*.09})`;
        cx.lineWidth = .8 + j*.5;
        for (let i = 0; i <= 180; i++) {
          const a = (i/180)*Math.PI*2;
          let r = 180 + j*28 + Math.sin(a*5+t)*45 + Math.cos(a*3-t*1.8)*28;
          if (mouseRef?.current?.x != null) {
            const px=W/2+Math.cos(a)*r, py=H/2+Math.sin(a)*r;
            const dx=mouseRef.current.x-px, dy=mouseRef.current.y-py;
            const dist=Math.sqrt(dx*dx+dy*dy);
            if (dist<220) r += (220-dist)*.45;
          }
          const x=W/2+Math.cos(a)*r, y=H/2+Math.sin(a)*r;
          i===0 ? cx.moveTo(x,y) : cx.lineTo(x,y);
        }
        cx.closePath(); cx.stroke();
      }
      t += .04; animId = requestAnimationFrame(draw);
    };
    resize(); draw();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(animId); };
  }, [canvasRef, mouseRef]);
}

// ─── Flow Canvas ─────────────────────────────────────────────────────────────
export function useFlowCanvas(canvasRef, mouseRef) {
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const cx = cv.getContext("2d");
    let animId, particles = [];
    const resize = () => { cv.width = window.innerWidth; cv.height = window.innerHeight; };
    const makeParticles = () => {
      const count = Math.min(1200, Math.floor((cv.width*cv.height)/1400));
      particles = Array.from({length:count}, () => ({
        x: Math.random()*cv.width, y: Math.random()*cv.height,
        vx:0, vy:0,
        speed: Math.random()*1.1+.4,
        size:  Math.random()*1.1+.4,
        col:   Math.random()>.45 ? "rgba(0,242,254," : "rgba(245,158,11,",
        angle: 0,
      }));
    };
    const draw = () => {
      cx.fillStyle = "rgba(0,0,8,0.04)";
      cx.fillRect(0, 0, cv.width, cv.height);
      const zoom=.004, mx=mouseRef?.current?.x??cv.width/2, my=mouseRef?.current?.y??cv.height/2;
      particles.forEach(p => {
        p.angle = (Math.sin(p.x*zoom)+Math.cos(p.y*zoom))*Math.PI*2;
        const dx=mx-p.x, dy=my-p.y, dist=Math.sqrt(dx*dx+dy*dy);
        if (dist<130) p.angle -= ((130-dist)/130)*2.2;
        p.vx=Math.cos(p.angle)*p.speed; p.vy=Math.sin(p.angle)*p.speed;
        p.x+=p.vx; p.y+=p.vy;
        if (p.x<0) p.x=cv.width; if (p.x>cv.width) p.x=0;
        if (p.y<0) p.y=cv.height; if (p.y>cv.height) p.y=0;
        cx.fillStyle = p.col+"0.65)";
        cx.beginPath(); cx.arc(p.x,p.y,p.size,0,Math.PI*2); cx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    resize(); makeParticles(); draw();
    window.addEventListener("resize", () => { resize(); makeParticles(); });
    return () => { cancelAnimationFrame(animId); };
  }, [canvasRef, mouseRef]);
}

// ─── Cursor hook ─────────────────────────────────────────────────────────────
export function useCursor(mouseRef, cursorRef, cursorDotRef) {
  useEffect(() => {
    let rx=0, ry=0, rafId;
    const onMove = (e) => {
      if (mouseRef) mouseRef.current = { x: e.clientX, y: e.clientY };
      if (cursorDotRef?.current) {
        cursorDotRef.current.style.left = e.clientX+"px";
        cursorDotRef.current.style.top  = e.clientY+"px";
      }
    };
    const moveCursor = () => {
      if (mouseRef) { rx += (mouseRef.current.x - rx)*.12; ry += (mouseRef.current.y - ry)*.12; }
      if (cursorRef?.current) {
        cursorRef.current.style.left = rx+"px";
        cursorRef.current.style.top  = ry+"px";
      }
      rafId = requestAnimationFrame(moveCursor);
    };
    window.addEventListener("mousemove", onMove);
    moveCursor();
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(rafId); };
  }, [mouseRef, cursorRef, cursorDotRef]);
}
