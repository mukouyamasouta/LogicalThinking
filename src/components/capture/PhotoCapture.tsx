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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = "";
  };

  /* 画像選択済み */
  if (imageDataUrl) {
    return (
      <div style={{ position: "relative" }}>
        <img src={imageDataUrl} alt="広告" style={{
          width: "100%", maxHeight: 320, objectFit: "contain",
          background: "var(--bg-subtle)", borderRadius: "var(--radius)",
          border: "1px solid var(--border)", display: "block",
        }} />
        {analyzing && (
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            background: "rgba(0,0,0,0.65)", color: "#fff",
            padding: "8px 12px", borderRadius: "0 0 var(--radius) var(--radius)",
            display: "flex", alignItems: "center", gap: 8, fontSize: 13,
          }}>
            <Loader2 size={13} style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />
            {progress}
          </div>
        )}
        {!analyzing && (
          <button onClick={() => onChange({ dataUrl: undefined, features: undefined, copyText: undefined })}
            className="btn" style={{ position: "absolute", top: 8, right: 8, padding: "4px 8px", fontSize: 12 }}>
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
            ★ iOS Safari で最も確実な方法:
               <label> が <input> を直接包む。
               JS不使用・CSSトリックなし・HTMLの基本仕様のみ。
               input を display:none にしても label タップで確実に開く。
               ※ capture属性は絶対につけない（つけるとカメラのみになる）
          */}
          <label style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: "var(--radius)",
            background: "var(--accent)", color: "#fff",
            fontSize: 13, fontWeight: 500,
            cursor: analyzing ? "not-allowed" : "pointer",
            opacity: analyzing ? 0.5 : 1,
          }}>
            <input
              type="file"
              accept="image/*"
              disabled={analyzing}
              onChange={handleChange}
              style={{ display: "none" }}
            />
            <FolderOpen size={14} />
            アルバム・スクショを選ぶ
          </label>

          {/* カメラ直接起動（capture属性あり） */}
          <label style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: "var(--radius)",
            background: "var(--bg-elevated)", color: "var(--text)",
            border: "1px solid var(--border)",
            fontSize: 13, fontWeight: 500,
            cursor: analyzing ? "not-allowed" : "pointer",
            opacity: analyzing ? 0.5 : 1,
          }}>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              disabled={analyzing}
              onChange={handleChange}
              style={{ display: "none" }}
            />
            <Camera size={14} />
            カメラで撮影
          </label>

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
