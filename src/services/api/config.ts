import axios from "axios";
import { storage } from "../../utils/storage";

const API_PATH =
  import.meta.env.VITE_affordablewellness_API_PATH ?? "/affordablewellness_token_proxy";
const API_HOST =
  import.meta.env.VITE_API_HOST ?? "https://panel.whitelabelmd.com";
const USE_DEV_PROXY = import.meta.env.VITE_USE_DEV_PROXY === "true";
const USE_SAME_ORIGIN = import.meta.env.VITE_API_SAME_ORIGIN === "true";

export const API_ORIGIN =
  import.meta.env.DEV && USE_DEV_PROXY
    ? API_PATH
    : USE_SAME_ORIGIN
      ? API_PATH
      : `${API_HOST}${API_PATH}`;

export const PANEL_ORIGIN = API_HOST;

export const SITE_ID =
  (import.meta.env.VITE_SITE_ID as string) ?? "329";

const credentialsConfig = {
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
};

export const api = axios.create({
  baseURL: `${API_ORIGIN}/api`,
  ...credentialsConfig,
});

export const whitelabelApi180 = axios.create({
  baseURL: `${PANEL_ORIGIN}/wlmdbackend/api/client/site/${SITE_ID}`,
  withCredentials: true,
});

export const mdIntegrationsApi = axios.create({
  baseURL: `${PANEL_ORIGIN}/v1/site/${SITE_ID}`,
  withCredentials: true,
});

function isSessionExpiredMessage(message?: string): boolean {
  if (!message) {
    return false;
  }
  const lower = message.toLowerCase();
  return (
    lower.includes("session expired") ||
    lower.includes("token expired") ||
    lower.includes("unauthorized")
  );
}

function handleSessionExpired(message?: unknown) {
  storage.clearAuth();
  if (typeof message === "string") {
    console.warn("Session expired:", message);
  }
  window.location.href = "/login";
}

export async function ensureCsrfCookieIfNeeded(): Promise<void> {
  if (!import.meta.env.DEV || import.meta.env.VITE_USE_DEV_PROXY !== "true") {
    return;
  }

  try {
    await axios.get(`${API_ORIGIN}/sanctum/csrf-cookie`, {
      withCredentials: true,
    });
  } catch {
    // Never block login if CSRF preflight fails.
  }
}

api.interceptors.response.use(
  (response) => {
    const data = response.data as { status?: number; message?: string };
    if (data?.status === 0 && isSessionExpiredMessage(data.message)) {
      handleSessionExpired(data.message);
    }
    return response;
  },
  (error) => {
    const data = error.response?.data as { status?: number; message?: string };
    const message =
      typeof data?.message === "string" ? data.message : undefined;
    const status = error.response?.status;

    if (
      status === 401 ||
      status === 419 ||
      (data?.status === 0 && isSessionExpiredMessage(message)) ||
      (status === 0 && isSessionExpiredMessage(message))
    ) {
      handleSessionExpired(message);
    }

    return Promise.reject(error);
  },
);
