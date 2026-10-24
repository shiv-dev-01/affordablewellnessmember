/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_affordablewellness_API_PATH: string;
  readonly VITE_API_HOST: string;
  readonly VITE_SITE_ID: string;
  readonly VITE_USE_DEV_PROXY: string;
  readonly VITE_API_SAME_ORIGIN: string;
  readonly VITE_PORTAL_LOGIN_WITH_TOKEN_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
