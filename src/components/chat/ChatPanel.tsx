import { useEffect, useRef, useState } from "react";
import { ArrowRight, Send, Loader2, Lightbulb } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { StepIndicator } from "./StepIndicator";
import { HintCard } from "./HintCard";
import { STEPS } from "../../lib/frameworks";
import type { AnalysisRecord } from "../../types";

interface Props {
  record: AnalysisRecord;
  busy: boolean;
  onSend: (text: string) => void;
  onAdvance: () => void;
}

export function ChatPanel({ record, busy, onSend, onAdvance }: Props) {
  const [input, setInput] = useState("");
  const [showHint, setShowHint] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [record.messages]);

  useEffect(() => {
    setShowHint(false);
  }, [record.currentStep]);

  const submit = () => {
    if (!input.trim() || busy) return;
    onSend(input);
    setInput("");
  };

  const currentStepMeta = record.currentStep ? STEPS[record.currentStep - 1] : null;
  const canAdvance = !!record.currentStep && record.answers.some(a => a.step === record.currentStep);

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", height: "min(72vh, 720px)" }}>
      <div style={{
        padding: "14px 18px", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
      }}>
        <StepIndicator current={record.currentStep} />
        {currentStepMeta && (
          <div style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "right" }}>
            STEP {currentStepMeta.id} · <strong style={{ color: "var(--text)" }}>{currentStepMeta.title}</strong>
          </div>
        )}
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "16px 18px" }}>
        {record.messages.map(m => <MessageBubble key={m.id} message={m} />)}
        {currentStepMeta && (
          <div className="subtle" style={{ marginTop: 12, padding: "10px 14px", background: "var(--bg-subtle)", borderRadius: "var(--radius)", borderLeft: "3px solid var(--accent)" }}>
            問い: {currentStepMeta.question}
          </div>
        )}
        {showHint && record.currentStep && (
          <div style={{ marginTop: 12 }}>
            <HintCard step={record.currentStep} difficulty={record.difficulty} />
          </div>
        )}
        {busy && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, color: "var(--text-muted)", fontSize: 13 }}>
            <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> 思考中...
          </div>
        )}
      </div>

      <div style={{ borderTop: "1px solid var(--border)", padding: "12px 14px" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <button
            className="btn btn-ghost"
            onClick={() => setShowHint(v => !v)}
            disabled={!record.currentStep}
            title="ヒントを表示"
          >
            <Lightbulb size={16} />
          </button>
          <textarea
            className="textarea"
            style={{ minHeight: 44, maxHeight: 160 }}
            placeholder={record.currentStep ? "考えを書いてみよう..." : "『分析開始』と入力するとSTEP 1へ"}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
            }}
          />
          <button className="btn btn-primary" onClick={submit} disabled={busy || !input.trim()}>
            <Send size={14} />
          </button>
          <button
            className="btn"
            onClick={onAdvance}
            disabled={!canAdvance || busy}
            title={record.currentStep === 5 ? "結果へ" : "次のステップへ"}
          >
            {record.currentStep === 5 ? "結果へ" : "次へ"} <ArrowRight size={14} />
          </button>
        </div>
        <div className="subtle" style={{ marginTop: 6, paddingLeft: 4 }}>⌘/Ctrl + Enter で送信</div>
      </div>
    </div>
  );
}
