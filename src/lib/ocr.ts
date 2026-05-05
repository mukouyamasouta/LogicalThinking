import Tesseract from "tesseract.js";

export async function extractText(dataUrl: string): Promise<string> {
  try {
    const { data } = await Tesseract.recognize(dataUrl, "jpn+eng", {
      logger: () => {},
    });
    return (data.text ?? "").replace(/\s+/g, " ").trim();
  } catch (e) {
    console.warn("[ocr] failed", e);
    return "";
  }
}
