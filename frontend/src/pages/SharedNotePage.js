import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/axios";
import { YN_CSS, useNeuralCanvas, useCursor } from "./NeuralBackground";

export default function SharedNotePage() {
  const { token }             = useParams();
  const [note, setNote]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const neuralRef    = useRef(null);
  const mouseRef     = useRef({ x: null, y: null });
  const cursorRef    = useRef(null);
  const cursorDotRef = useRef(null);

  useNeuralCanvas(neuralRef);
  useCursor(mouseRef, cursorRef, cursorDotRef);

  useEffect(() => {
    API.get(`/notes/shared/${token}`)
      .then(({ data }) => setNote(data))
      .catch(err => setError(err.response?.data?.message || "Note not found or link expired"))
      .finally(() => setLoading(false));
  }, [token]);

  const formatDate = d => new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" });

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <>
      <style>{YN_CSS}</style>
      <canvas ref={neuralRef} className="yn-canvas" style={{ zIndex:0 }} />
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", zIndex:10, flexDirection:"column", gap:16 }}>
        <div style={{ width:34, height:34, border:"1.5px solid rgba(0,229,255,.3)", borderTopColor:"var(--yn-cyan)", borderRadius:"50%", animation:"spin 1s linear infinite" }} />
        <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:".72rem", color:"rgba(240,240,255,.4)", letterSpacing:"2px" }}>LOADING NOTE…</p>
      </div>
    </>
  );

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) return (
    <>
      <style>{YN_CSS}</style>
      <canvas ref={neuralRef} className="yn-canvas" style={{ zIndex:0 }} />
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", zIndex:10, padding:24 }}>
        <div className="yn-card" style={{ maxWidth:420, width:"100%", padding:"56px 40px", textAlign:"center", animation:"fadeUp .7s both" }}>
          <div style={{ width:64, height:64, borderRadius:"50%", background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.25)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", fontSize:26 }}>🔗</div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.4rem", color:"#f0f0ff", marginBottom:10 }}>Link not found</h2>
          <p style={{ fontSize:"14px", color:"rgba(240,240,255,.45)", lineHeight:1.7, marginBottom:32 }}>{error}</p>
          <Link to="/login" className="yn-btn-primary">Go to YourNotes →</Link>
        </div>
      </div>
    </>
  );

  // ── Note ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{YN_CSS + `
        .shared-body { min-height:100vh; position:relative; z-index:10; }
        .shared-topbar {
          position: sticky; top:0; z-index:100;
          background: rgba(3,3,15,0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0,229,255,.1);
          padding: 0 5%; height:58px;
          display:flex; align-items:center; justify-content:space-between;
        }
      `}</style>
      <div ref={cursorRef}    className="yn-cursor-ring" />
      <div ref={cursorDotRef} className="yn-cursor-dot"  />
      <canvas ref={neuralRef} className="yn-canvas" style={{ zIndex:0 }} />

      <div className="shared-body">
        <div className="shared-topbar">
          <Link to="/" className="yn-nav-logo">YOURNOTES</Link>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ padding:"4px 12px", background:"rgba(255,255,255,.05)", color:"rgba(240,240,255,.4)", borderRadius:99, fontSize:"11px", fontFamily:"'JetBrains Mono',monospace", letterSpacing:"1px" }}>
              VIEW ONLY
            </span>
            <Link to="/register" className="yn-btn-primary" style={{ padding:"8px 18px", fontSize:".78rem" }}>
              Sign up free →
            </Link>
          </div>
        </div>

        <div style={{ maxWidth:760, margin:"0 auto", padding:"60px 24px 120px", animation:"fadeUp .7s .1s both" }}>
          {/* Tags */}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
            {note.folder && (
              <span style={{ padding:"4px 12px", background:"rgba(139,92,246,.12)", color:"#a78bfa", borderRadius:99, fontSize:"11px", fontFamily:"'JetBrains Mono',monospace", border:"1px solid rgba(139,92,246,.25)" }}>
                📁 {note.folder.name}
              </span>
            )}
            {note.tags?.map(tag => (
              <span key={tag} style={{ padding:"4px 12px", background:"rgba(255,255,255,.05)", color:"rgba(240,240,255,.5)", borderRadius:99, fontSize:"11px", fontFamily:"'JetBrains Mono',monospace", border:"1px solid rgba(255,255,255,.08)" }}>
                #{tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"clamp(2rem,5vw,3.2rem)", letterSpacing:"-1.5px", marginBottom:24, lineHeight:1.1, color:"#f0f0ff" }}>
            {note.title}
          </h1>

          {/* Author */}
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:48 }}>
            <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,var(--yn-cyan),var(--yn-purple))", display:"flex", alignItems:"center", justifyContent:"center", color:"#000", fontSize:"14px", fontWeight:700 }}>
              {note.author?.[0]?.toUpperCase() || "U"}
            </div>
            <span style={{ fontSize:"14px", color:"rgba(240,240,255,.6)", fontWeight:500 }}>{note.author || "Unknown"}</span>
            <span style={{ color:"rgba(255,255,255,.1)" }}>·</span>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"12px", color:"rgba(240,240,255,.3)" }}>
              Updated {formatDate(note.updatedAt)}
            </span>
          </div>

          {/* Divider */}
          <div style={{ height:1, background:"linear-gradient(90deg,var(--yn-cyan),transparent)", marginBottom:52, opacity:.2 }} />

          {/* Body */}
          <div style={{ fontSize:"16px", color:"rgba(240,240,255,.65)", lineHeight:1.95, whiteSpace:"pre-wrap", wordBreak:"break-word", fontWeight:400, letterSpacing:".01em" }}>
            {note.plainText || note.content || (
              <span style={{ color:"rgba(240,240,255,.3)", fontStyle:"italic" }}>This note has no content.</span>
            )}
          </div>

          {/* Footer CTA */}
          <div style={{ marginTop:96, background:"linear-gradient(135deg,rgba(0,229,255,.07),rgba(139,92,246,.07))", border:"1px solid rgba(0,229,255,.2)", borderRadius:24, padding:"clamp(32px,5vw,56px)", textAlign:"center" }}>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:".65rem", letterSpacing:"4px", color:"var(--yn-cyan)", marginBottom:16 }}>// JOIN YOURNOTES</div>
            <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"clamp(1.4rem,3vw,2rem)", letterSpacing:-1, marginBottom:12, color:"#f0f0ff" }}>
              Take smarter notes with AI
            </h3>
            <p style={{ fontSize:"14px", color:"rgba(240,240,255,.45)", marginBottom:32, lineHeight:1.7, maxWidth:420, margin:"0 auto 32px" }}>
              Summaries, flashcards, spaced repetition, folders — completely free to start.
            </p>
            <Link to="/register" className="yn-btn-primary" style={{ padding:"14px 36px", fontSize:".9rem" }}>
              Get started free →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
