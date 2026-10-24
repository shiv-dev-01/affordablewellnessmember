import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiHost = env.VITE_API_HOST ?? "https://panel.whitelabelmd.com";
  const apiPath = env.VITE_affordablewellness_API_PATH ?? "/affordablewellness_token_proxy";

  return {
    plugins: [react()],
    resolve: {
      dedupe: ["react", "react-dom"],
    },
    optimizeDeps: {
      include: ["react", "react-dom", "react-router-dom"],
    },
    server: {
      proxy: {
        [apiPath]: {
          target: apiHost,
          changeOrigin: true,
          secure: true,
          cookieDomainRewrite: "",
          cookiePathRewrite: "/",
        },
        "/affordablewellness/api": {
          target: apiHost,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  };
});
