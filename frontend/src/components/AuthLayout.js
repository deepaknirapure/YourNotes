// यह component Login aur Register pages ka shared left panel hai
// Dono pages ka left side same dikhta tha - isliye ek component banaya

// Field input component - reusable input field
export function FieldGroup({ label, icon, type, placeholder, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Label */}
      <label style={{
        fontSize: 11, fontWeight: 600,
        letterSpacing: '0.06em', textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.3)',
      }}>
        {label}
      </label>
      {/* Input with icon */}
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', left: 11,
          top: '50%', transform: 'translateY(-50%)',
          color: 'rgba(255,255,255,0.25)', pointerEvents: 'none',
          display: 'flex', alignItems: 'center',
        }}>
          {icon}
        </div>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px 10px 36px',
            background: '#111',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 6,
            fontSize: 14,
            fontFamily: 'inherit',
            color: '#fff',
            outline: 'none',
            transition: 'border-color 0.15s',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#E55B2D';
            e.target.style.background = 'rgba(229,91,45,0.04)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(255,255,255,0.08)';
            e.target.style.background = '#111';
          }}
        />
      </div>
    </div>
  );
}

// Auth page CSS - Login aur Register dono ke liye
export const AUTH_STYLES = `
  /* ── Reset & root ── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
 
  /* ── Two-panel layout ── */
  .auth-root {
    display: flex;
    min-height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #0a0a0f;
    color: #e2e8f0;
  }
 
  /* ── Left panel ── */
  .auth-left {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 45%;
    min-height: 100vh;
    padding: 32px 40px;
    background: linear-gradient(145deg, #0f0f1a 0%, #111128 100%);
    overflow: hidden;
  }
  .al-bg {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 80% 60% at 30% 40%, rgba(99,102,241,0.12) 0%, transparent 70%);
    pointer-events: none;
  }
  .al-glow-bottom {
    position: absolute;
    bottom: -80px;
    left: -60px;
    width: 340px;
    height: 340px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%);
    pointer-events: none;
  }
  .al-ring {
    position: absolute;
    top: -100px;
    right: -100px;
    width: 380px;
    height: 380px;
    border-radius: 50%;
    border: 1px solid rgba(99,102,241,0.08);
    pointer-events: none;
  }
 
  /* Logo */
  .al-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    z-index: 1;
  }
  .al-logo-mark {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .al-logo-name {
    font-size: 15px;
    font-weight: 600;
    color: #f1f5f9;
    letter-spacing: -0.2px;
  }
 
  /* Body content */
  .al-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    z-index: 1;
    padding: 24px 0;
  }
  .al-pill {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 5px 12px;
    border-radius: 999px;
    border: 1px solid rgba(99,102,241,0.25);
    background: rgba(99,102,241,0.07);
    font-size: 11.5px;
    font-weight: 500;
    color: #a5b4fc;
    letter-spacing: 0.3px;
    width: fit-content;
    margin-bottom: 20px;
    text-transform: uppercase;
  }
  .al-pill-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #6366f1;
    box-shadow: 0 0 6px #6366f1;
  }
  .al-headline {
    font-size: 36px;
    font-weight: 700;
    line-height: 1.15;
    color: #f8fafc;
    letter-spacing: -0.8px;
    margin-bottom: 14px;
  }
  .al-headline em {
    font-style: normal;
    background: linear-gradient(90deg, #818cf8, #c084fc);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .al-desc {
    font-size: 14px;
    color: #94a3b8;
    line-height: 1.65;
    max-width: 340px;
    margin-bottom: 32px;
  }
 
  /* Feature list */
  .al-feats { display: flex; flex-direction: column; gap: 14px; }
  .al-feat {
    display: flex;
    align-items: flex-start;
    gap: 13px;
  }
  .al-feat-icon {
    width: 36px;
    height: 36px;
    border-radius: 9px;
    border: 1px solid transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .al-feat-name {
    font-size: 13px;
    font-weight: 600;
    color: #e2e8f0;
    margin-bottom: 2px;
  }
  .al-feat-text {
    font-size: 12.5px;
    color: #64748b;
    line-height: 1.5;
  }
 
  /* Footer */
  .al-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 1;
    padding-top: 16px;
    border-top: 1px solid rgba(255,255,255,0.05);
  }
  .al-footer-copy { font-size: 11.5px; color: #475569; }
  .al-footer-badge {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11.5px;
    color: #475569;
  }
 
  /* ── Right panel ── */
  .auth-right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #09090f;
    padding: 40px 24px;
  }
  .ar-wrap {
    width: 100%;
    max-width: 400px;
  }
  .ar-step {
    font-size: 11px;
    font-weight: 600;
    color: #6366f1;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    margin-bottom: 10px;
  }
  .ar-title {
    font-size: 26px;
    font-weight: 700;
    color: #f1f5f9;
    letter-spacing: -0.5px;
    margin-bottom: 6px;
  }
  .ar-sub {
    font-size: 13.5px;
    color: #64748b;
    margin-bottom: 28px;
    line-height: 1.5;
  }
 
  /* Form fields */
  .ar-field { margin-bottom: 16px; }
  .ar-label {
    display: block;
    font-size: 12.5px;
    font-weight: 500;
    color: #94a3b8;
    margin-bottom: 6px;
    letter-spacing: 0.1px;
  }
  .ar-iw {
    position: relative;
    display: flex;
    align-items: center;
  }
  .ar-ico {
    position: absolute;
    left: 12px;
    color: #475569;
    display: flex;
    align-items: center;
    pointer-events: none;
  }
  .ar-ico-right {
    position: absolute;
    right: 12px;
    color: #475569;
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 0;
    transition: color 0.15s;
  }
  .ar-ico-right:hover { color: #94a3b8; }
  .ar-input {
    width: 100%;
    padding: 10px 12px 10px 36px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    color: #e2e8f0;
    font-size: 13.5px;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
  }
  .ar-input.has-right-icon { padding-right: 38px; }
  .ar-input::placeholder { color: #334155; }
  .ar-input:focus {
    border-color: rgba(99,102,241,0.5);
    background: rgba(99,102,241,0.04);
  }
 
  /* Forgot link */
  .ar-forgot {
    display: block;
    text-align: right;
    font-size: 12.5px;
    color: #6366f1;
    text-decoration: none;
    margin-top: -6px;
    margin-bottom: 20px;
  }
  .ar-forgot:hover { color: #818cf8; }
 
  /* Submit button */
  .ar-btn {
    width: 100%;
    padding: 11px 16px;
    border-radius: 10px;
    border: none;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: opacity 0.2s, transform 0.1s;
    letter-spacing: 0.1px;
  }
  .ar-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
  .ar-btn:active:not(:disabled) { transform: translateY(0); }
  .ar-btn:disabled { opacity: 0.5; cursor: not-allowed; }
 
  /* Spinner */
  .ar-spinner {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.25);
    border-top-color: #fff;
    animation: spin 0.7s linear infinite;
    display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
 
  /* Nav / footer link */
  .ar-nav {
    text-align: center;
    font-size: 13px;
    color: #64748b;
    margin-top: 20px;
  }
  .ar-nav a {
    color: #6366f1;
    text-decoration: none;
    font-weight: 500;
  }
  .ar-nav a:hover { color: #818cf8; }
 
  /* Terms text */
  .ar-terms {
    font-size: 11.5px;
    color: #475569;
    text-align: center;
    margin-top: 14px;
    line-height: 1.6;
  }
  .ar-terms a { color: #6366f1; text-decoration: none; }
  .ar-terms a:hover { text-decoration: underline; }
 
  /* Password strength bar */
  .pw-strength {
    margin-top: 6px;
    height: 3px;
    border-radius: 4px;
    background: rgba(255,255,255,0.06);
    overflow: hidden;
  }
 
  /* ── Centered auth pages (ForgotPassword / ResetPassword) ── */
  .auth-page {
    min-height: 100vh;
    background: #09090f;
    display: flex;
    flex-direction: column;
  }
  .auth-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 32px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .auth-nav-logo { display: flex; align-items: center; gap: 9px; text-decoration: none; }
  .auth-nav-mark {
    width: 28px;
    height: 28px;
    border-radius: 7px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .auth-nav-name {
    font-size: 14px;
    font-weight: 600;
    color: #f1f5f9;
  }
  .auth-nav-back {
    font-size: 13px;
    color: #64748b;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 5px;
    transition: color 0.15s;
  }
  .auth-nav-back:hover { color: #94a3b8; }
 
  .auth-center {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 24px;
  }
  .auth-card {
    width: 100%;
    max-width: 420px;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 18px;
    padding: 36px 32px;
  }
 
  /* Centered card header */
  .ac-icon-wrap {
    width: 48px;
    height: 48px;
    border-radius: 13px;
    background: rgba(99,102,241,0.1);
    border: 1px solid rgba(99,102,241,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 18px;
    color: #818cf8;
  }
  .ac-title {
    font-size: 22px;
    font-weight: 700;
    color: #f1f5f9;
    letter-spacing: -0.4px;
    margin-bottom: 7px;
  }
  .ac-sub {
    font-size: 13.5px;
    color: #64748b;
    line-height: 1.6;
    margin-bottom: 26px;
  }
  .ac-back {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 13px;
    color: #64748b;
    text-decoration: none;
    margin-top: 18px;
    transition: color 0.15s;
  }
  .ac-back:hover { color: #94a3b8; }
 
  /* Alert banners */
  .ac-alert {
    padding: 11px 14px;
    border-radius: 9px;
    font-size: 13px;
    margin-bottom: 16px;
    display: flex;
    align-items: flex-start;
    gap: 8px;
    line-height: 1.5;
  }
  .ac-alert.error {
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.2);
    color: #fca5a5;
  }
  .ac-alert.success {
    background: rgba(34,197,94,0.08);
    border: 1px solid rgba(34,197,94,0.2);
    color: #86efac;
  }
 
  /* ── Responsive ── */
  @media (max-width: 768px) {
    .auth-left { display: none; }
    .auth-right { padding: 32px 20px; }
    .auth-card { padding: 28px 20px; }
  }
`;

// AUTH_SHARED_STYLES as alias — same styles, used by pages that import from styles/auth.css.js
export const AUTH_SHARED_STYLES = AUTH_STYLES;