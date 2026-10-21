import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("🔴 ErrorBoundary caught:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            background: "var(--bg-2)",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div
            style={{
              maxWidth: 600,
              width: "100%",
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: 32,
              boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "rgba(226,55,68,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                marginBottom: 20,
              }}
            >
              ⚠️
            </div>

            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                marginBottom: 8,
                color: "var(--text)",
              }}
            >
              Something went wrong
            </h1>

            <p
              style={{
                fontSize: 14,
                color: "var(--text-2)",
                marginBottom: 20,
                lineHeight: 1.6,
              }}
            >
              We hit an unexpected error while loading this page. You can try
              reloading or go back home.
            </p>

            {/* Show the actual error in dev for debugging */}
            {import.meta.env.DEV && this.state.error && (
              <details
                style={{
                  background: "var(--bg-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 20,
                  fontSize: 12,
                  color: "var(--text-3)",
                  fontFamily: "monospace",
                }}
              >
                <summary
                  style={{
                    cursor: "pointer",
                    fontWeight: 700,
                    color: "var(--danger)",
                    marginBottom: 8,
                  }}
                >
                  Error details
                </summary>
                <div
                  style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                >
                  <strong>{this.state.error.toString()}</strong>
                  {this.state.errorInfo?.componentStack && (
                    <pre style={{ marginTop: 8, fontSize: 11, opacity: 0.8 }}>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={this.handleReload}
                style={{
                  padding: "12px 20px",
                  borderRadius: 8,
                  border: "none",
                  background: "var(--primary)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                🔄 Reload Page
              </button>
              <button
                onClick={this.handleHome}
                style={{
                  padding: "12px 20px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--bg)",
                  color: "var(--text)",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                🏠 Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
