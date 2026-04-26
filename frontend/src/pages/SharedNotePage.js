// ye Shared Note page hai - publicly shared notes dikhata hai (bina login ke)
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/axios";

export default function SharedNotePage() {
  const { token }             = useParams();
  const [note, setNote]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    API.get(`/notes/shared/${token}`)
      .then(({ data }) => setNote(data))
      .catch(err => setError(err.response?.data?.message || "Note not found or link expired"))
      .finally(() => setLoading(false));
  }, [token]);

  const formatDate = d => new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" });

  const sharedStyles = `
    
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @keyframes ynFadeUp { from { opacity:0; transform: translateY(24px); } to { opacity:1; transform:translateY(0); } }
    @keyframes ynSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes ynPulse { 0%,100% { opacity:1; } 50% { opacity:.3; } }

    body { background: #0a0a0a; }

    .yn-note-content h1,.yn-note-content h2,.yn-note-content h3 {
      font-family: 'Syne', sans-serif; color: #fff;
      margin: 1.5em 0 .6em; letter-spacing: -.5px;
    }
    .yn-note-content h1 { font-size: 28px; font-weight: 800; }
    .yn-note-content h2 { font-size: 22px; font-weight: 700; }
    .yn-note-content h3 { font-size: 18px; font-weight: 700; }
    .yn-note-content p { margin-bottom: 1em; color: rgba(255,255,255,.65); line-height: 1.8; }
    .yn-note-content ul,.yn-note-content ol { margin: .8em 0 .8em 1.6em; color: rgba(255,255,255,.55); line-height: 1.8; }
    .yn-note-content code { background: rgba(229,91,45,.1); border: 1px solid rgba(229,91,45,.2); padding: 2px 7px; border-radius: 5px; font-size: 13px; color: #E55B2D; }
    .yn-note-content pre { background: #111; border: 1px solid rgba(255,255,255,.08); border-radius: 10px; padding: 16px; margin: 1em 0; overflow-x: auto; }
    .yn-note-content blockquote { border-left: 3px solid #E55B2D; padding-left: 16px; margin: 1em 0; color: rgba(255,255,255,.45); font-style: italic; }
    .yn-note-content strong { color: #fff; font-weight: 700; }
    .yn-note-content a { color: #E55B2D; }

    .yn-cta-btn {
      display: inline-flex; align-items: center; gap: 8px;
      background: #E55B2D; color: #fff; padding: 13px 24px;
      border-radius: 9px; font-weight: 700; font-size: 14px;
      text-decoration: none; transition: all .2s; font-family: 'Inter', 'DM Sans', sans-serif;
    }
    .yn-cta-btn:hover { background: #c94d23; transform: translateY(-1px); }
  `;

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <>
      <style>{sharedStyles}</style>
      <div style={{ minHeight:"100vh", background:"#0a0a0a", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16 }}>
        <div style={{ width:34, height:34, border:"2px solid rgba(229,91,45,.25)", borderTopColor:"#E55B2D", borderRadius:"50%", animation:"ynSpin 1s linear infinite" }} />
        <p style={{ fontFamily:"'Inter','DM Sans',sans-serif", fontSize:13, color:"rgba(255,255,255,.25)", letterSpacing:"2px", textTransform:"uppercase" }}>Loading note…</p>
      </div>
    </>
  );

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) return (
    <>
      <style>{sharedStyles}</style>
      <div style={{ minHeight:"100vh", background:"#0a0a0a", display:"flex", alignItems:"center", justifyContent:"center", padding:24, fontFamily:"'Inter','DM Sans',sans-serif" }}>
        <div style={{ maxWidth:420, width:"100%", background:"#111", border:"1px solid rgba(255,255,255,.08)", borderRadius:18, padding:"52px 40px", textAlign:"center", animation:"ynFadeUp .7s both" }}>
          <div style={{ width:64, height:64, borderRadius:"50%", background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.2)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", fontSize:26 }}>🔗</div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.5rem", color:"#fff", marginBottom:10, letterSpacing:"-.5px" }}>Link not found</h2>
          <p style={{ fontSize:14, color:"rgba(255,255,255,.35)", lineHeight:1.7, marginBottom:32 }}>{error}</p>
          <Link to="/login" className="yn-cta-btn" style={{ justifyContent:"center" }}>Go to YourNotes →</Link>
        </div>
      </div>
    </>
  );

  // ── Note ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{sharedStyles}</style>
      <div style={{ minHeight:"100vh", background:"#0a0a0a", fontFamily:"'Inter','DM Sans',sans-serif", color:"#fff" }}>

        {/* Sticky top bar */}
        <nav style={{
          position:"sticky", top:0, zIndex:100,
          background:"rgba(10,10,10,.95)", backdropFilter:"blur(20px)",
          borderBottom:"1px solid rgba(255,255,255,.06)",
          padding:"0 5%", height:60,
          display:"flex", alignItems:"center", justifyContent:"space-between",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:28, height:28, background:"#E55B2D", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.375 2.625a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/>
              </svg>
            </div>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, color:"#fff" }}>
              Your<span style={{ color:"#E55B2D" }}>Notes</span>
            </span>
            <span style={{ fontSize:12, color:"rgba(255,255,255,.25)", marginLeft:4 }}>· Shared Note</span>
          </div>
          <Link to="/register" className="yn-cta-btn" style={{ padding:"8px 18px", fontSize:13 }}>
            Get YourNotes Free →
          </Link>
        </nav>

        {/* Content */}
        <div style={{ maxWidth:760, margin:"0 auto", padding:"60px 5% 100px", animation:"ynFadeUp .7s both" }}>

          {/* Tags row */}
          {(note.tags?.length > 0 || note.folder) && (
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:24 }}>
              {note.folder && (
                <span style={{ background:"rgba(229,91,45,.1)", border:"1px solid rgba(229,91,45,.2)", color:"#E55B2D", borderRadius:5, padding:"3px 12px", fontSize:11, fontWeight:700 }}>
                  📂 {note.folder.name}
                </span>
              )}
              {note.tags?.map(tag => (
                <span key={tag} style={{ background:"rgba(255,255,255,.06)", borderRadius:5, padding:"3px 10px", fontSize:11, color:"rgba(255,255,255,.4)", fontWeight:600 }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:42, color:"#fff", letterSpacing:"-1.8px", lineHeight:1.1, marginBottom:20 }}>
            {note.title || "Untitled Note"}
          </h1>

          {/* Meta row */}
          <div style={{ display:"flex", gap:20, marginBottom:40, paddingBottom:28, borderBottom:"1px solid rgba(255,255,255,.07)", flexWrap:"wrap" }}>
            <div style={{ fontSize:13, color:"rgba(255,255,255,.35)" }}>
              <span style={{ color:"rgba(255,255,255,.2)" }}>Shared by </span>
              <span style={{ color:"rgba(255,255,255,.6)", fontWeight:600 }}>{note.user?.name || "Anonymous"}</span>
            </div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,.25)" }}>
              {formatDate(note.createdAt)}
            </div>
            {note.aiSummary && (
              <span style={{ background:"rgba(229,91,45,.1)", border:"1px solid rgba(229,91,45,.2)", color:"#E55B2D", borderRadius:5, padding:"2px 10px", fontSize:11, fontWeight:700 }}>
                ⚡ AI Summary Available
              </span>
            )}
          </div>

          {/* AI Summary */}
          {note.aiSummary && (
            <div style={{ background:"rgba(229,91,45,.06)", border:"1px solid rgba(229,91,45,.18)", borderRadius:14, padding:"24px 28px", marginBottom:36 }}>
              <p style={{ fontSize:11, fontWeight:800, color:"#E55B2D", letterSpacing:".1em", marginBottom:12, textTransform:"uppercase" }}>✨ AI Summary</p>
              <p style={{ fontSize:14, color:"rgba(255,255,255,.6)", lineHeight:1.8 }}>{note.aiSummary}</p>
            </div>
          )}

          {/* Note content */}
          <div className="yn-note-content"
            dangerouslySetInnerHTML={{ __html: note.content || note.plainText || "<p>No content</p>" }}
            style={{ fontSize:16, lineHeight:1.9 }}
          />

          {/* CTA footer */}
          <div style={{ marginTop:72, padding:"40px", background:"#111", border:"1px solid rgba(255,255,255,.08)", borderRadius:16, textAlign:"center" }}>
            <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color:"#fff", letterSpacing:"-.5px", marginBottom:10 }}>
              Apne bhi notes organize karo AI ke saath.
            </p>
            <p style={{ fontSize:14, color:"rgba(255,255,255,.4)", marginBottom:24 }}>YourNotes — Free forever for students.</p>
            <Link to="/register" className="yn-cta-btn">
              Start for Free →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
