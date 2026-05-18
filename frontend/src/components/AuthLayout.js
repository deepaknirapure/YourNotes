// Shared auth design system — imported by all auth pages
// Aesthetic: Refined editorial dark/light split, warm ink palette, geometric details

export const AUTH_SHARED_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@400;500;600;700;800;900&display=swap');

  *,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes pulseRing {
    0%,100% { box-shadow: 0 0 0 0 rgba(249,115,22,0.25); }
    50%      { box-shadow: 0 0 0 8px rgba(249,115,22,0); }
  }

  :root {
    /* Brand */
    --accent:       #f97316;
    --accent-dark:  #c85d0a;
    --accent-glow:  rgba(249,115,22,0.15);
    --accent-ring:  rgba(249,115,22,0.25);

    /* Light side */
    --bg:     #f5f3ef;
    --sur:    #ffffff;
    --brd:    #e5e1d9;
    --brd2:   #cec9bf;

    /* Text */
    --tx:     #1a1814;
    --tx2:    #3d3a33;
    --tx3:    #7c7870;
    --tx4:    #aca89f;

    /* Dark panel */
    --dark:       #111009;
    --dark-sur:   #1c1a15;
    --dark-brd:   rgba(255,255,255,0.07);

    /* Status */
    --green:  #16a34a;
    --green-bg: rgba(22,163,74,0.08);
    --red:    #dc2626;
    --red-bg: rgba(220,38,38,0.07);

    /* Type */
    --font-sans:   'Geist', system-ui, sans-serif;
    --font-serif:  'Instrument Serif', Georgia, serif;
  }

  body {
    font-family: var(--font-sans);
    background: var(--bg);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* ════════════════════════════════════
     SPLIT LAYOUT  (Login / Register)
  ════════════════════════════════════ */

  .auth-root {
    display: flex;
    min-height: 100vh;
    min-height: 100dvh;
  }

  /* ── Dark Left Panel ── */
  .auth-left {
    flex: 1.15;
    background: var(--dark);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 48px 52px;
    position: relative;
    overflow: hidden;
  }

  /* Geometric background texture */
  .al-bg {
    position: absolute;
    inset: 0;
    z-index: 0;
    overflow: hidden;
  }
  .al-bg::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 48px 48px;
  }
  .al-bg::after {
    content: '';
    position: absolute;
    width: 520px; height: 520px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(249,115,22,0.18) 0%, transparent 60%);
    top: -160px; right: -160px;
  }
  .al-glow-bottom {
    position: absolute;
    width: 300px; height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 65%);
    bottom: -80px; left: -80px;
    z-index: 0;
  }

  /* Decorative ring accent */
  .al-ring {
    position: absolute;
    width: 320px; height: 320px;
    border-radius: 50%;
    border: 1px solid rgba(249,115,22,0.08);
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    z-index: 0;
  }
  .al-ring::before {
    content: '';
    position: absolute;
    inset: 30px;
    border-radius: 50%;
    border: 1px solid rgba(249,115,22,0.05);
  }

  /* Logo */
  .al-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    position: relative;
    z-index: 1;
  }
  .al-logo-mark {
    width: 34px; height: 34px;
    border-radius: 9px;
    background: var(--accent);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    box-shadow: 0 4px 16px rgba(249,115,22,0.4);
  }
  .al-logo-name {
    font-size: 17px;
    font-weight: 800;
    color: #f0ece4;
    letter-spacing: -0.4px;
  }

  /* Left panel content */
  .al-body {
    position: relative;
    z-index: 1;
  }
  .al-pill {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: rgba(249,115,22,0.10);
    border: 1px solid rgba(249,115,22,0.20);
    color: #f97316;
    border-radius: 100px;
    padding: 5px 14px;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    margin-bottom: 26px;
  }
  .al-pill-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: var(--accent);
    animation: pulseRing 2s ease infinite;
  }
  .al-headline {
    font-family: var(--font-serif);
    font-size: clamp(32px, 3.6vw, 50px);
    color: #f0ece4;
    line-height: 1.08;
    letter-spacing: -0.5px;
    margin-bottom: 18px;
  }
  .al-headline em {
    color: var(--accent);
    font-style: italic;
  }
  .al-desc {
    font-size: 14.5px;
    color: rgba(240,236,228,0.40);
    line-height: 1.75;
    font-weight: 400;
    max-width: 340px;
    margin-bottom: 40px;
  }

  /* Feature list */
  .al-feats {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  .al-feat {
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }
  .al-feat-icon {
    width: 38px; height: 38px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    border: 1px solid var(--dark-brd);
    background: rgba(255,255,255,0.03);
  }
  .al-feat-icon svg {
    width: 17px; height: 17px;
  }
  .al-feat-name {
    font-size: 13.5px;
    font-weight: 700;
    color: rgba(240,236,228,0.90);
    margin-bottom: 3px;
    letter-spacing: -0.2px;
  }
  .al-feat-text {
    font-size: 12.5px;
    color: rgba(240,236,228,0.35);
    line-height: 1.55;
  }

  /* Left footer */
  .al-footer {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid var(--dark-brd);
    padding-top: 20px;
  }
  .al-footer-copy {
    font-size: 11px;
    color: rgba(240,236,228,0.20);
    font-weight: 500;
    letter-spacing: 0.02em;
  }
  .al-footer-badge {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 10.5px;
    font-weight: 700;
    color: rgba(240,236,228,0.22);
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  /* ── Right Form Panel ── */
  .auth-right {
    flex: 1;
    background: var(--bg);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 7%;
  }
  .ar-wrap {
    width: 100%;
    max-width: 420px;
    animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
  }

  /* Form header */
  .ar-step {
    font-size: 10.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.9px;
    color: var(--accent);
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .ar-step::before {
    content: '';
    display: inline-block;
    width: 16px; height: 1.5px;
    background: var(--accent);
    border-radius: 2px;
  }
  .ar-title {
    font-family: var(--font-serif);
    font-size: 30px;
    font-weight: 400;
    color: var(--tx);
    letter-spacing: -0.3px;
    margin-bottom: 6px;
    line-height: 1.15;
  }
  .ar-sub {
    font-size: 14px;
    color: var(--tx3);
    font-weight: 400;
    margin-bottom: 32px;
  }

  /* Fields */
  .ar-field {
    margin-bottom: 16px;
  }
  .ar-label {
    display: block;
    font-size: 11px;
    font-weight: 700;
    color: var(--tx3);
    text-transform: uppercase;
    letter-spacing: 0.7px;
    margin-bottom: 7px;
  }
  .ar-iw {
    position: relative;
  }
  .ar-ico {
    position: absolute;
    left: 13px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--tx4);
    pointer-events: none;
    display: flex;
  }
  .ar-ico-right {
    position: absolute;
    right: 13px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--tx3);
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    display: flex;
  }
  .ar-input {
    width: 100%;
    padding: 12px 14px 12px 42px;
    background: var(--sur);
    border: 1.5px solid var(--brd);
    border-radius: 10px;
    font-family: var(--font-sans);
    font-size: 14px;
    font-weight: 400;
    color: var(--tx);
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    -webkit-appearance: none;
  }
  .ar-input.has-right-icon {
    padding-right: 42px;
  }
  .ar-input::placeholder { color: var(--tx4); }
  .ar-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-ring);
    background: var(--sur);
  }
  .ar-input:hover:not(:focus) {
    border-color: var(--brd2);
  }

  /* Strength bar */
  .pw-strength {
    display: flex;
    gap: 4px;
    margin-top: 7px;
  }
  .pw-seg {
    height: 3px;
    flex: 1;
    border-radius: 99px;
    background: var(--brd);
    transition: background 0.3s;
  }
  .pw-seg.filled-weak   { background: var(--red); }
  .pw-seg.filled-fair   { background: #f59e0b; }
  .pw-seg.filled-strong { background: var(--green); }

  /* Forgot link */
  .ar-forgot {
    display: block;
    text-align: right;
    font-size: 12.5px;
    font-weight: 600;
    color: var(--tx3);
    text-decoration: none;
    margin-top: -6px;
    margin-bottom: 22px;
    transition: color 0.15s;
  }
  .ar-forgot:hover { color: var(--accent); }

  /* Terms text */
  .ar-terms {
    font-size: 12px;
    color: var(--tx4);
    line-height: 1.65;
    margin-bottom: 18px;
    margin-top: 4px;
  }
  .ar-terms a {
    color: var(--tx3);
    text-decoration: underline;
    text-underline-offset: 2px;
    font-weight: 500;
    transition: color 0.15s;
  }
  .ar-terms a:hover { color: var(--accent); }

  /* CTA button */
  .ar-btn {
    width: 100%;
    padding: 13px 20px;
    background: var(--tx);
    color: #fff;
    border: none;
    border-radius: 10px;
    font-family: var(--font-sans);
    font-size: 14.5px;
    font-weight: 700;
    cursor: pointer;
    letter-spacing: -0.1px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
    position: relative;
    overflow: hidden;
  }
  .ar-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
    background-size: 200% auto;
    opacity: 0;
    transition: opacity 0.3s;
  }
  .ar-btn:hover:not(:disabled) {
    background: var(--accent);
    box-shadow: 0 6px 24px rgba(249,115,22,0.30);
  }
  .ar-btn:hover:not(:disabled)::after { opacity: 1; }
  .ar-btn:active:not(:disabled) { transform: scale(0.99); }
  .ar-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  /* Spinner */
  .ar-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.25);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.65s linear infinite;
    flex-shrink: 0;
  }

  /* Divider */
  .ar-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 22px 0;
  }
  .ar-divider-line {
    flex: 1;
    height: 1px;
    background: var(--brd);
  }
  .ar-divider-text {
    font-size: 11px;
    color: var(--tx4);
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  /* Footer nav link */
  .ar-nav {
    text-align: center;
    margin-top: 24px;
    font-size: 13.5px;
    color: var(--tx3);
    font-weight: 400;
  }
  .ar-nav a {
    color: var(--accent);
    font-weight: 700;
    text-decoration: none;
    transition: color 0.15s;
  }
  .ar-nav a:hover { color: var(--accent-dark); }

  /* ════════════════════════════════════
     CENTERED CARD LAYOUT  (ForgotPW / ResetPW)
  ════════════════════════════════════ */

  .auth-page {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    background: var(--bg);
  }

  /* Top nav bar */
  .auth-nav {
    height: 58px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32px;
    background: var(--sur);
    border-bottom: 1px solid var(--brd);
    position: sticky;
    top: 0;
    z-index: 10;
  }
  .auth-nav-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
  }
  .auth-nav-mark {
    width: 28px; height: 28px;
    border-radius: 7px;
    background: var(--tx);
    display: flex; align-items: center; justify-content: center;
  }
  .auth-nav-mark svg {
    width: 13px; height: 13px;
    color: #fff;
  }
  .auth-nav-name {
    font-size: 15px;
    font-weight: 800;
    color: var(--tx);
    letter-spacing: -0.4px;
  }
  .auth-nav-name span { color: var(--accent); }

  .auth-nav-back {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: var(--tx3);
    text-decoration: none;
    transition: color 0.15s;
    padding: 6px 12px;
    border: 1px solid var(--brd);
    border-radius: 7px;
    background: var(--sur);
  }
  .auth-nav-back:hover {
    color: var(--accent);
    border-color: var(--accent-ring);
  }

  /* Centered card area */
  .auth-center {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    position: relative;
  }
  .auth-center::before {
    content: '';
    position: absolute;
    width: 600px; height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(249,115,22,0.05) 0%, transparent 65%);
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  .auth-card {
    width: 100%;
    max-width: 420px;
    background: var(--sur);
    border: 1px solid var(--brd);
    border-radius: 20px;
    padding: 44px 40px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.04), 0 12px 40px rgba(0,0,0,0.06);
    animation: fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both;
    position: relative;
    z-index: 1;
  }

  /* Card icon header */
  .ac-icon-wrap {
    width: 52px; height: 52px;
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 22px;
    position: relative;
  }
  .ac-icon-wrap::after {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: 15px;
    border: 1px solid rgba(249,115,22,0.15);
  }

  .ac-title {
    font-family: var(--font-serif);
    font-size: 24px;
    font-weight: 400;
    color: var(--tx);
    text-align: center;
    letter-spacing: -0.3px;
    margin-bottom: 8px;
  }
  .ac-sub {
    font-size: 13.5px;
    color: var(--tx3);
    text-align: center;
    line-height: 1.7;
    margin-bottom: 28px;
    font-weight: 400;
  }
  .ac-sub strong {
    color: var(--tx2);
    font-weight: 600;
  }

  /* Alert box */
  .ac-alert {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 11px 14px;
    border-radius: 9px;
    font-size: 13px;
    line-height: 1.55;
    margin-bottom: 18px;
    font-weight: 500;
  }
  .ac-alert.error {
    background: var(--red-bg);
    border: 1px solid rgba(220,38,38,0.15);
    color: var(--red);
  }
  .ac-alert.success {
    background: var(--green-bg);
    border: 1px solid rgba(22,163,74,0.15);
    color: var(--green);
  }
  .ac-alert svg { flex-shrink: 0; margin-top: 1px; }

  /* Back link in card */
  .ac-back {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-top: 22px;
    font-size: 13px;
    font-weight: 600;
    color: var(--tx3);
    text-decoration: none;
    transition: color 0.15s;
  }
  .ac-back:hover { color: var(--accent); }

  /* ════════════════════════════════════
     RESPONSIVE
  ════════════════════════════════════ */

  @media (max-width: 900px) {
    .auth-left { display: none; }
    .auth-right {
      background: var(--sur);
      padding: 40px 24px;
      min-height: 100vh;
      align-items: flex-start;
      padding-top: 56px;
    }
    .ar-wrap { animation: none; }
  }

  @media (max-width: 520px) {
    .auth-nav { padding: 0 16px; }
    .auth-card { padding: 32px 22px; border-radius: 16px; }
  }
`;
