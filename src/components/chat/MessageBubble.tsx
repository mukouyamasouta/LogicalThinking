import type { ChatMessage } from "../../types";

export function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === "system") {
    return (
      <div style={{
        textAlign: "center", margin: "12px 0", fontSize: 12,
        color: "var(--text-subtle)",
      }}>
        — {message.content} —
      </div>
    );
  }
  const isUser = message.role === "user";
  return (
    <div
      className="fade-in"
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        margin: "8px 0",
      }}
    >
      <div style={{
        maxWidth: "82%",
        padding: "10px 14px",
        borderRadius: isUser ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
        background: isUser ? "var(--accent-soft)" : "var(--bg-elevated)",
        color: "var(--text)",
        border: isUser ? "1px solid transparent" : "1px solid var(--border)",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        lineHeight: 1.65,
      }}>
        {message.content}
      </div>
    </div>
  );
}
