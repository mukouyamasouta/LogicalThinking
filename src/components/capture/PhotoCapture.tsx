import { useState } from "react";
import { Camera, FolderOpen, Loader2, X, Image } from "lucide-react";
import { fileToDataUrl, extractImageFeatures } from "../../lib/imageFeatures";
import { extractText } from "../../lib/ocr";
import type { ImageFeatures } from "../../types";

interface Props {
  imageDataUrl?: string;
  onChange: (data: { dataUrl?: string; features?: ImageFeatures; copyText?: string }) => void;
}

export function PhotoCapture({ imageDataUrl, onChange }: Props) {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState("");

  const handleFile = async (file: File) => {
    if (analyzing) return;
    setAnalyzing(true);

    setProgress("画像を読み込み中...");
    const dataUrl = await fileToDataUrl(file);
    onChange({ dataUrl });

    setProgress("色・構図を解析中...");
    const features = await extractImageFeatures(dataUrl);
    onChange({ dataUrl, features });

    setProgress("文字認識中（数十秒かかる場合があります）...");
    const copyText = await extractText(dataUrl);
    onChange({ dataUrl, features, copyText });

    setAnalyzing(false);
    setProgress("");
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = "";
  };

  const clear = () => {
    onChange({ dataUrl: undefined, features: undefined, copyText: undefined });
  };

  /* 画像選択済み */
  if (imageDataUrl) {
    return (
      <div style={{ position: "relative" }}>
        <img
          src={imageDataUrl}
          alt="広告"
          style={{
            width: "100%", maxHeight: 320, objectFit: "contain",
            background: "var(--bg-subtle)", borderRadius: "var(--radius)",
            border: "1px solid var(--border)", display: "block",
          }}
        />
        {analyzing && (
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            background: "rgba(0,0,0,0.65)", color: "#fff",
            padding: "8px 12px",
            borderRadius: "0 0 var(--radius) var(--radius)",
            display: "flex", alignItems: "center", gap: 8, fontSize: 13,
          }}>
            <Loader2 size={13} style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />
            {progress}
          </div>
        )}
        {!analyzing && (
          <button onClick={clear} className="btn"
            style={{ position: "absolute", top: 8, right: 8, padding: "4px 8px", fontSize: 12 }}>
            <X size={13} /> 削除
          </button>
        )}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* 未選択 */
  return (
    <div>
      <div style={{
        border: "1.5px dashed var(--border-strong)", borderRadius: "var(--radius)",
        background: "var(--bg-subtle)", padding: "20px 16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 14 }}>
          <Image size={18} style={{ color: "var(--text-muted)" }} />
          <span style={{ fontSize: 14, color: "var(--text-muted)" }}>広告の画像を追加（任意）</span>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          {/*
            iOS Safari 対応: inputをボタンに完全に重ねて直接タップさせる。
            label経由 / JS .click() はどちらもiOSでブロックされるケースがある。
            input自体をopacity:0で重ねる方式が最も確実。
          */}
          <FileButton
            id="album"
            icon={<FolderOpen size={14} />}
            label="アルバム・スクショを選ぶ"
            primary
            disabled={analyzing}
            onChange={onInputChange}
          />
          <FileButton
            id="camera"
            icon={<Camera size={14} />}
            label="カメラで撮影"
            primary={false}
            disabled={analyzing}
            capture="environment"
            onChange={onInputChange}
          />
        </div>

        <div className="subtle" style={{ textAlign: "center", marginTop: 10 }}>
          📱 写真フォルダ・スクリーンショット・PCファイルに対応
        </div>
      </div>

      {analyzing && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, color: "var(--text-muted)", fontSize: 13 }}>
          <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
          {progress}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

interface FileBtnProps {
  id: string;
  icon: React.ReactNode;
  label: string;
  primary: boolean;
  disabled: boolean;
  capture?: "environment" | "user";
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function FileButton({ id, icon, label, primary, disabled, capture, onChange }: FileBtnProps) {
  return (
    /* relative コンテナ: 見た目はここで作り、その上にinputを重ねる */
    <div style={{ position: "relative", display: "inline-flex" }}>
      {/* 見た目のボタン（イベントは受け取らない） */}
      <div
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "8px 16px", borderRadius: "var(--radius)",
          fontSize: 13, fontWeight: 500,
          background: primary ? "var(--accent)" : "var(--bg-elevated)",
          color: primary ? "#fff" : "var(--text)",
          border: primary ? "none" : "1px solid var(--border)",
          opacity: disabled ? 0.5 : 1,
          userSelect: "none",
          pointerEvents: "none", // 見た目だけ、タップはinputが受ける
        }}
      >
        {icon}
        {label}
      </div>

      {/*
        本体: 透明なinputがボタン全体を覆う。
        ユーザーはこのinputを直接タップするのでiOSがブロックしない。
      */}
      <input
        key={id}
        type="file"
        accept="image/*"
        {...(capture ? { capture } : {})}
        disabled={disabled}
        onChange={onChange}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0,
          cursor: disabled ? "not-allowed" : "pointer",
          fontSize: 0,
        }}
      />
    </div>
  );
}
