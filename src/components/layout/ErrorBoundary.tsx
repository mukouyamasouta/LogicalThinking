import { Component, type ReactNode } from "react";

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}>
        <div className="card" style={{ maxWidth: 480, width: "100%", borderColor: "var(--danger)" }}>
          <strong style={{ color: "var(--danger)", display: "block", marginBottom: 8 }}>
            予期しないエラーが発生しました
          </strong>
          <p className="muted" style={{ marginBottom: 16, whiteSpace: "pre-wrap", fontSize: 13 }}>
            {this.state.error.message.slice(0, 400)}
          </p>
          <button
            className="btn btn-primary"
            onClick={() => {
              this.setState({ error: null });
              window.location.reload();
            }}
          >
            ページを再読み込み
          </button>
        </div>
      </div>
    );
  }
}
