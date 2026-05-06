import { useRef, useState } from "react";
import { Camera, FolderOpen, Loader2, X, Image } from "lucide-react";
import { fileToDataUrl, extractImageFeatures } from "../../lib/imageFeatures";
import { extractText } from "../../lib/ocr";
import type { ImageFeatures } from "../../types";

interface Props {
  imageDataUrl?: string;
  onChange: (data: { dataUrl?: string; features?: ImageFeatures; copyText?: string }) => void;
}

export function PhotoCapture({ imageDataUrl, onChange }: Props) {
  // ファイル選択（ギャラリー・スクリーンショット・ファイル全般）
  const fileRef = useRef<HTMLInputElement>(null);
  // カメラ直接起動（モバイル）
  const cameraRef = useRef<HTMLInputElement>(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState<string>("");

  const handleFile = async (file: File) => {
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

  const clear = () => {
    onChange({ dataUrl: undefined, features: undefined, copyText: undefined });
    if (fileRef.current) fileRef.current.value = "";
    if (cameraRef.current) cameraRef.current.value = "";
  };

  if (imageDataUrl) {
    return (
      <div style={{ position: "relative" }}>
        <img
          src={imageDataUrl}
          alt="広告"
          style={{
            width: "100%", maxHeight: 320, objectFit: "contain",
            background: "var(--bg-subtle)", borderRadius: "var(--radius)",
            border: "1px solid var(--border)",
          }}
        />
        {analyzing && (
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            background: "rgba(0,0,0,0.6)", color: "#fff",
            padding: "8px 12px", borderRadius: "0 0 var(--radius) var(--radius)",
            display: "flex", alignItems: "center", gap: 8, fontSize: 13,
          }}>
            <Loader2 size={13} style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />
            {progress}
          </div>
        )}
        {!analyzing && (
          <button
            onClick={clear}
            className="btn"
            style={{ position: "absolute", top: 8, right: 8, padding: "4px 8px", fontSize: 12 }}
            aria-label="画像を削除"
          >
            <X size={13} /> 削除
          </button>
        )}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
      {/* capture属性なし → ギャラリー・スクリーンショット・ファイル全般 */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      {/* capture="environment" → モバイルでカメラを直接起動 */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      <div style={{
        border: "1.5px dashed var(--border-strong)", borderRadius: "var(--radius)",
        background: "var(--bg-subtle)", padding: "20px 16px",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 8, marginBottom: 14,
        }}>
          <Image size={18} style={{ color: "var(--text-muted)" }} />
          <span style={{ fontSize: 14, color: "var(--text-muted)" }}>広告の画像を追加（任意）</span>
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <button
            className="btn"
            onClick={() => fileRef.current?.click()}
            disabled={analyzing}
            style={{ fontSize: 13 }}
          >
            <FolderOpen size={14} />
            ギャラリー / スクショ
          </button>
          <button
            className="btn"
            onClick={() => cameraRef.current?.click()}
            disabled={analyzing}
            style={{ fontSize: 13 }}
          >
            <Camera size={14} />
            カメラで撮影
          </button>
        </div>

        <div className="subtle" style={{ textAlign: "center", marginTop: 10 }}>
          スクリーンショット・写真フォルダ・PCファイルに対応
        </div>
      </div>

      {analyzing && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          marginTop: 10, color: "var(--text-muted)", fontSize: 13,
        }}>
          <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
          {progress}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
