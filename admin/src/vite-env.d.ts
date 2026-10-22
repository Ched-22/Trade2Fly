/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEV_API_URL?: string;
  readonly VITE_MARKETPLACE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
