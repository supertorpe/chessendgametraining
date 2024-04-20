/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly GOOGLE_CLIENT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
