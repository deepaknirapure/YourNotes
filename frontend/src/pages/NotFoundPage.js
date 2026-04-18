import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", padding: "24px", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700;800&family=Syne:wght@700;800&display=swap');
        @keyframes ynFadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ynFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        .yn-404-btn{padding:13px 28px;border-radius:9px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:8px}
        .yn-404-btn-primary{background:#E55B2D;color:#fff;border:none}
        .yn-404-btn-primary:hover{background:#c94d23;transform:translateY(-2px);box-shadow:0 12px 32px rgba(229,91,45,.3)}
        .yn-404-btn-ghost{background:transparent;color:rgba(255,255,255,.6);border:1.5px solid rgba(255,255,255,.15)}
        .yn-404-btn-ghost:hover{border-color:rgba(255,255,255,.4);color:#fff}
      `}</style>

      {/* Background */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{ position: "absolute", width: "1px", height: "200%", background: "rgba(255,255,255,0.025)", left: `${10 + i * 20}%`, top: "-50%", transform: "rotate(15deg)" }} />
        ))}
        <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 300, background: "radial-gradient(ellipse, rgba(229,91,45,.07) 0%, transparent 70%)" }} />
      </div>

      <div style={{ textAlign: "center", position: "relative", zIndex: 1, animation: "ynFadeUp .8s cubic-bezier(.16,1,.3,1) both" }}>
        {/* Big 404 */}
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(100px, 20vw, 180px)", fontWeight: 800, color: "rgba(229,91,45,.15)", lineHeight: 1, marginBottom: 8, animation: "ynFloat 4s ease-in-out infinite", userSelect: "none" }}>
          404
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 28, height: 28, background: "#E55B2D", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.375 2.625a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/>
            </svg>
          </div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: "#fff" }}>Your<span style={{ color: "#E55B2D" }}>Notes</span></span>
        </div>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(22px,4vw,32px)", fontWeight: 800, color: "#fff", letterSpacing: "-1px", marginBottom: 12 }}>
          Page Not Found
        </h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,.4)", marginBottom: 40, maxWidth: 360, margin: "0 auto 40px", lineHeight: 1.7 }}>
          Yeh page exist nahi karta ya delete ho gaya hai. Ghabrao mat — dashboard pe wapas jaate hain!
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="yn-404-btn yn-404-btn-primary" onClick={() => navigate("/dashboard")}>
            <Home size={16} /> Go to Dashboard
          </button>
          <button className="yn-404-btn yn-404-btn-ghost" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
