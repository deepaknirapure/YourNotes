import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', system-ui, sans-serif; background: #f7f7f5; }
  input:focus { outline: none; }
  button { font-family: inherit; }
`;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await API.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{globalStyles}</style>
      <div
        style={{
          minHeight: "100vh",
          background: "#f7f7f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div style={{ width: "100%", maxWidth: "380px" }}>
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: 500,
                color: "#1a1a1a",
                fontFamily: "'Crimson Pro', Georgia, serif",
                letterSpacing: "-0.3px",
                marginBottom: "4px",
              }}
            >
              Forgot Password?
            </h1>
            <p style={{ fontSize: "14px", color: "#999" }}>
              {sent ? "Check your inbox" : "We'll send you a reset link"}
            </p>
          </div>

          {/* Card */}
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              border: "1px solid #ebebea",
              padding: "28px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
            }}
          >
            {!sent ? (
              <>
                {error && (
                  <div
                    style={{
                      background: "#fff5f5",
                      border: "1px solid #fecaca",
                      borderRadius: "8px",
                      padding: "10px 12px",
                      marginBottom: "16px",
                      fontSize: "13px",
                      color: "#dc2626",
                    }}
                  >
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: "20px" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "13px",
                        color: "#555",
                        marginBottom: "6px",
                        fontWeight: 500,
                      }}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #e0e0dc",
                        borderRadius: "8px",
                        fontSize: "14px",
                        color: "#1a1a1a",
                        background: "#fafaf8",
                        fontFamily: "inherit",
                        transition: "border .15s",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#1a1a1a")}
                      onBlur={(e) => (e.target.style.borderColor = "#e0e0dc")}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: "100%",
                      padding: "11px",
                      background: "#1a1a1a",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: 500,
                      cursor: loading ? "not-allowed" : "pointer",
                      opacity: loading ? 0.7 : 1,
                      transition: "opacity .13s",
                    }}
                  >
                    {loading ? "Sending…" : "Send Reset Link"}
                  </button>
                </form>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>📬</div>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "#1a1a1a",
                    marginBottom: "8px",
                  }}
                >
                  Email sent!
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#999",
                    lineHeight: 1.6,
                    marginBottom: "20px",
                  }}
                >
                  Reset link bhej diya hai{" "}
                  <strong style={{ color: "#1a1a1a" }}>{email}</strong> pe. 15
                  minutes mein expire hoga.
                </p>
                <Link
                  to="/login"
                  style={{
                    display: "inline-block",
                    padding: "10px 24px",
                    background: "#1a1a1a",
                    color: "#fff",
                    borderRadius: "8px",
                    textDecoration: "none",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  Back to Login
                </Link>
              </div>
            )}
          </div>

          <p
            style={{
              textAlign: "center",
              marginTop: "18px",
              fontSize: "13.5px",
              color: "#999",
            }}
          >
            Remember your password?{" "}
            <Link
              to="/login"
              style={{
                color: "#1a1a1a",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
