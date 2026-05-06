import { useEffect, useState } from "react";
import { Play, RotateCcw, Loader2, Clock } from "lucide-react";
import { AppHeader } from "./components/layout/AppHeader";
import { DifficultyToggle } from "./components/layout/DifficultyToggle";
import { PhotoCapture } from "./components/capture/PhotoCapture";
import { AdContextForm } from "./components/capture/AdContextForm";
import { ChatPanel } from "./components/chat/ChatPanel";
import { ScoreCard } from "./components/result/ScoreCard";
import { Summary } from "./components/result/Summary";
import { GrowthChart } from "./components/result/GrowthChart";
import { HistoryList } from "./components/history/HistoryList";
import { ExportButton } from "./components/history/ExportButton";
import { ShareButton } from "./components/share/ShareButton";
import { FrameworkModal } from "./components/modals/FrameworkModal";
import { ErrorBoundary } from "./components/layout/ErrorBoundary";
import { useAnalysis } from "./hooks/useAnalysis";
import { useHistory } from "./hooks/useHistory";
import { useElapsedTime, formatElapsed } from "./hooks/useElapsedTime";
import { readShareFromUrl } from "./lib/share";
import type { AdContext, Difficulty } from "./types";

export default function App() {
  const [view, setView] = useState<"analyze" | "history">("analyze");
  const [difficulty, setDifficulty] = useState<Difficulty>("intermediate");
  const [context, setContext] = useState<AdContext>({});
  const [frameworksOpen, setFrameworksOpen] = useState(false);
  const [sharedView, setSharedView] = useState<boolean>(false);

  const analysis = useAnalysis();
  const history = useHistory();

  useEffect(() => {
    const shared = readShareFromUrl();
    if (shared) {
      analysis.loadExisting(shared);
      setSharedView(true);
      setView("analyze");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (analysis.record) history.upsert(analysis.record);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysis.record?.updatedAt, analysis.record?.id]);

  const startNew = async () => {
    setSharedView(false);
    await analysis.start(difficulty, context);
  };

  const reset = () => {
    setSharedView(false);
    analysis.reset();
    setContext({});
    if (window.location.hash) window.location.hash = "";
  };

  return (
    <ErrorBoundary>
      <div className="app-shell">
        <AppHeader
          view={view}
          onChangeView={(v) => { setView(v); }}
          onOpenFrameworks={() => setFrameworksOpen(true)}
        />

        {/* セットアップ画面：record が来るまで表示し続ける（starting中もここに留まる） */}
        {view === "analyze" && !analysis.record && (
          <SetupScreen
            difficulty={difficulty}
            onDifficulty={setDifficulty}
            context={context}
            onContext={setContext}
            onStart={startNew}
            starting={analysis.starting}
            error={analysis.error}
          />
        )}

        {view === "analyze" && analysis.record && (
          <AnalyzeScreen
            record={analysis.record}
            busy={analysis.busy}
            error={analysis.error}
            onSend={analysis.sendMessage}
            onAdvance={analysis.advanceStep}
            onReset={reset}
            shared={sharedView}
          />
        )}

        {view === "history" && (
          <HistoryScreen
            records={history.records}
            onOpen={(r) => { analysis.loadExisting(r); setView("analyze"); setSharedView(false); }}
            onDelete={history.del}
            onExport={history.exportAll}
          />
        )}

        <FrameworkModal open={frameworksOpen} onClose={() => setFrameworksOpen(false)} />
      </div>
    </ErrorBoundary>
  );
}

/* ──────────────────────────────────────────── */
/* SetupScreen                                   */
/* ──────────────────────────────────────────── */
function SetupScreen(props: {
  difficulty: Difficulty;
  onDifficulty: (d: Difficulty) => void;
  context: AdContext;
  onContext: (c: AdContext) => void;
  onStart: () => void;
  starting: boolean;
  error: string | null;
}) {
  const elapsed = useElapsedTime(props.starting);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="card">
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 16, flexWrap: "wrap", gap: 12,
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontFamily: "var(--font-serif)" }}>
              広告を題材に論理思考を鍛える
            </h2>
            <p className="muted" style={{ margin: "4px 0 0", fontSize: 14 }}>
              5ステップでターゲット〜代替案までを言語化します。
            </p>
          </div>
          <DifficultyToggle value={props.difficulty} onChange={props.onDifficulty} />
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          <PhotoCapture
            imageDataUrl={props.context.imageDataUrl}
            onChange={(d) => props.onContext({
              ...props.context,
              imageDataUrl: d.dataUrl,
              imageFeatures: d.features,
              copyText: d.copyText,
            })}
          />
          <AdContextForm value={props.context} onChange={props.onContext} />
          {props.context.copyText && (
            <div className="subtle" style={{ padding: "8px 12px", background: "var(--bg-subtle)", borderRadius: "var(--radius)" }}>
              OCR検出: {props.context.copyText.slice(0, 120)}{props.context.copyText.length > 120 ? "…" : ""}
            </div>
          )}
        </div>

        {/* エラー表示 */}
        {props.error && !props.starting && (
          <div className="card" style={{
            marginTop: 14, borderColor: "var(--danger)",
            color: "var(--danger)", padding: "12px 14px", fontSize: 13,
          }}>
            {props.error}
          </div>
        )}

        {/* 分析開始ボタン / ローディング */}
        <div style={{ marginTop: 18, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 14 }}>
          {props.starting && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)", fontSize: 13 }}>
              <Clock size={13} />
              <span>{formatElapsed(elapsed)} 経過</span>
              <div style={{ width: 80, height: 3, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${Math.min((elapsed / 30) * 100, 100)}%`,
                  background: elapsed > 20 ? "var(--warning)" : "var(--accent)",
                  transition: "width 1s linear",
                }} />
              </div>
            </div>
          )}
          <button
            className="btn btn-primary"
            onClick={props.onStart}
            disabled={props.starting}
            style={{ minWidth: 120 }}
          >
            {props.starting
              ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> AI が考え中…</>
              : <><Play size={14} /> 分析を開始</>
            }
          </button>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────── */
/* AnalyzeScreen                                */
/* ──────────────────────────────────────────── */
function AnalyzeScreen(props: {
  record: NonNullable<ReturnType<typeof useAnalysis>["record"]>;
  busy: boolean;
  error: string | null;
  onSend: (text: string) => void;
  onAdvance: () => void;
  onReset: () => void;
  shared: boolean;
}) {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      {props.shared && (
        <div className="card" style={{ background: "var(--accent-soft)", borderColor: "transparent", padding: "10px 14px" }}>
          シェアされた分析を閲覧中。続きを編集すると履歴に保存されます。
        </div>
      )}
      {props.error && (
        <div className="card" style={{ borderColor: "var(--danger)", color: "var(--danger)", fontSize: 13 }}>
          {props.error}
        </div>
      )}
      <ChatPanel
        record={props.record}
        busy={props.busy}
        onSend={props.onSend}
        onAdvance={props.onAdvance}
      />
      {props.record.finished && props.record.score && (
        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "1fr 1fr" }} className="result-grid">
          <ScoreCard score={props.record.score} />
          <Summary comment={props.record.score.comment} />
        </div>
      )}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
        <ShareButton record={props.record} />
        <button className="btn btn-ghost" onClick={props.onReset}>
          <RotateCcw size={14} /> 新しい分析
        </button>
      </div>
      <style>{`
        @media (max-width: 720px) {
          .result-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

/* ──────────────────────────────────────────── */
/* HistoryScreen                                */
/* ──────────────────────────────────────────── */
function HistoryScreen(props: {
  records: ReturnType<typeof useHistory>["records"];
  onOpen: (r: ReturnType<typeof useHistory>["records"][number]) => void;
  onDelete: (id: string) => void;
  onExport: () => void;
}) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <GrowthChart records={props.records} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0, fontSize: 17 }}>
          分析履歴 <span className="subtle">（{props.records.length}件）</span>
        </h2>
        <ExportButton onExport={props.onExport} />
      </div>
      <HistoryList records={props.records} onOpen={props.onOpen} onDelete={props.onDelete} />
    </div>
  );
}
