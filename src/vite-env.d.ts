/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MODEL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  interface Window {
    claude?: {
      complete: (prompt: string) => Promise<string>;
    };
  }
}

export {};
