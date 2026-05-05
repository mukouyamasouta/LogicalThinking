import { useRef, useState } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { fileToDataUrl, extractImageFeatures } from "../../lib/imageFeatures";
import { extractText } from "../../lib/ocr";
import type { ImageFeatures } from "../../types";

interface Props {
  imageDataUrl?: string;
  onChange: (data: { dataUrl?: string; features?: ImageFeatures; copyText?: string }) => void;
}

export function PhotoCapture({ imageDataUrl, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState<string>("");

  const handleFile = async (file: File) => {
    setAnalyzing(true);
    setProgress("画像を読み込み中...");
    const dataUrl = await fileToDataUrl(file);
    onChange({ dataUrl });
    setProgress("画像から特徴を抽出中...");
    const features = await extractImageFeatures(dataUrl);
    onChange({ dataUrl, features });
    setProgress("広告コピーを文字認識中（数十秒かかります）...");
    const copyText = await extractText(dataUrl);
    onChange({ dataUrl, features, copyText });
    setAnalyzing(false);
    setProgress("");
  };

  const clear = () => {
    onChange({ dataUrl: undefined, features: undefined, copyText: undefined });
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      {imageDataUrl ? (
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
          <button
            onClick={clear}
            className="btn"
            style={{ position: "absolute", top: 8, right: 8, padding: "6px 8px" }}
            aria-label="画像を削除"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileRef.current?.click()}
          disabled={analyzing}
          style={{
            width: "100%", padding: "32px 16px", borderRadius: "var(--radius)",
            border: "1.5px dashed var(--border-strong)", background: "var(--bg-subtle)",
            color: "var(--text-muted)", display: "flex", flexDirection: "column",
            alignItems: "center", gap: 8, transition: "all 0.15s",
          }}
        >
          <Camera size={26} />
          <div style={{ fontSize: 14 }}>広告の写真を撮影 / アップロード</div>
          <div className="subtle">任意・空欄でも分析できます</div>
        </button>
      )}
      {analyzing && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, color: "var(--text-muted)", fontSize: 13 }}>
          <Loader2 size={14} className="spin" style={{ animation: "spin 1s linear infinite" }} />
          {progress}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
