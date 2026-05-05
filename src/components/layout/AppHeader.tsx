import { Brain, History, BookOpen } from "lucide-react";

interface Props {
  view: "analyze" | "history";
  onChangeView: (v: "analyze" | "history") => void;
  onOpenFrameworks: () => void;
}

export function AppHeader({ view, onChangeView, onOpenFrameworks }: Props) {
  return (
    <header style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      paddingBottom: 20, marginBottom: 20, borderBottom: "1px solid var(--border)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Brain size={22} style={{ color: "var(--accent)" }} />
        <strong style={{ fontSize: 17, letterSpacing: "0.02em" }}>Logical Thinking</strong>
        <span className="subtle" style={{ marginLeft: 4 }}>広告で鍛える</span>
      </div>
      <nav style={{ display: "flex", gap: 4 }}>
        <button
          className={view === "analyze" ? "btn" : "btn btn-ghost"}
          onClick={() => onChangeView("analyze")}
        >
          <Brain size={14} /> 分析
        </button>
        <button
          className={view === "history" ? "btn" : "btn btn-ghost"}
          onClick={() => onChangeView("history")}
        >
          <History size={14} /> 履歴
        </button>
        <button className="btn btn-ghost" onClick={onOpenFrameworks}>
          <BookOpen size={14} /> 解説
        </button>
      </nav>
    </header>
  );
}
