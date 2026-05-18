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
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }

  .auth-wrap {
    display: flex;
    min-height: 100vh;
    background: #0a0a0a;
    font-family: 'Geist', -apple-system, sans-serif;
  }
  .auth-left {
    flex: 1;
    background: #000;
    border-right: 1px solid rgba(255,255,255,0.07);
    padding: 48px 6%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
  }
  .auth-right {
    width: 440px;
    padding: 0 48px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: #0a0a0a;
    animation: fadeUp 0.5s ease both;
  }
  .auth-grid-line {
    position: absolute;
    width: 1px;
    height: 200%;
    background: rgba(255,255,255,0.025);
    top: -50%;
    transform: rotate(12deg);
  }
  .auth-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 1px solid rgba(229,91,45,0.3);
    border-radius: 4px;
    padding: 3px 10px;
    margin-bottom: 24px;
  }
  .auth-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #E55B2D;
    animation: pulse 2s infinite;
  }
  .auth-btn {
    width: 100%;
    padding: 11px;
    background: #E55B2D;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .auth-btn:hover:not(:disabled) {
    background: #d14e24;
    box-shadow: 0 6px 20px rgba(229,91,45,0.3);
  }
  .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Mobile par left panel hide karo */
  @media (max-width: 768px) {
    .auth-left  { display: none !important; }
    .auth-right { width: 100% !important; padding: 40px 24px !important; min-height: 100vh; }
  }
`;
