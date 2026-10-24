import type { UserData } from "../types/auth";
import { getCookie, removeCookie, setCookie } from "./cookies";

const COOKIE_PREFIX = "affordablewellness_";

export const StorageKeys = {
  USER_DATA: `${COOKIE_PREFIX}userData`,
  AUTH_TOKEN: `${COOKIE_PREFIX}authToken`,
  PRODUCT_CATEGORY: `${COOKIE_PREFIX}productCategory`,
  PATIENTID: `${COOKIE_PREFIX}patientId`,
} as const;

const LEGACY_LOCAL_KEYS = {
  USER_DATA: "userData",
  AUTH_TOKEN: "authToken",
  LOGIN_TOKEN: "loginToken",
  PRODUCT_CATEGORY: "productCategory",
  PATIENTID: "patientId",
} as const;

function migrateFromLocalStorage(): void {
  const userData = localStorage.getItem(LEGACY_LOCAL_KEYS.USER_DATA);
  if (!getCookie(StorageKeys.USER_DATA) && userData) {
    setCookie(StorageKeys.USER_DATA, userData);
    localStorage.removeItem(LEGACY_LOCAL_KEYS.USER_DATA);
  }

  const authToken = localStorage.getItem(LEGACY_LOCAL_KEYS.AUTH_TOKEN);
  if (!getCookie(StorageKeys.AUTH_TOKEN) && authToken) {
    setCookie(StorageKeys.AUTH_TOKEN, authToken);
    localStorage.removeItem(LEGACY_LOCAL_KEYS.AUTH_TOKEN);
  }

  const patientId = localStorage.getItem(LEGACY_LOCAL_KEYS.PATIENTID);
  if (!getCookie(StorageKeys.PATIENTID) && patientId) {
    setCookie(StorageKeys.PATIENTID, patientId);
    localStorage.removeItem(LEGACY_LOCAL_KEYS.PATIENTID);
  }

  const productCategory = localStorage.getItem(
    LEGACY_LOCAL_KEYS.PRODUCT_CATEGORY,
  );
  if (!getCookie(StorageKeys.PRODUCT_CATEGORY) && productCategory) {
    setCookie(StorageKeys.PRODUCT_CATEGORY, productCategory);
    localStorage.removeItem(LEGACY_LOCAL_KEYS.PRODUCT_CATEGORY);
  }

  localStorage.removeItem(LEGACY_LOCAL_KEYS.LOGIN_TOKEN);
}

migrateFromLocalStorage();

export const storage = {
  setUserData: (data: UserData) => {
    setCookie(StorageKeys.USER_DATA, JSON.stringify(data));
  },

  getUserData: (): UserData | null => {
    const data = getCookie(StorageKeys.USER_DATA);
    return data ? JSON.parse(data) : null;
  },

  setAuthToken: (token: string) => {
    setCookie(StorageKeys.AUTH_TOKEN, token);
  },

  getAuthToken: () => {
    return getCookie(StorageKeys.AUTH_TOKEN);
  },

  setPatientId: (patientId: string) => {
    setCookie(StorageKeys.PATIENTID, patientId);
  },

  getPatientId: () => {
    return getCookie(StorageKeys.PATIENTID);
  },

  setProductCategory: (category: string) => {
    setCookie(StorageKeys.PRODUCT_CATEGORY, category);
  },

  getProductCategory: () => {
    return getCookie(StorageKeys.PRODUCT_CATEGORY);
  },

  clearAuth: () => {
    removeCookie(StorageKeys.USER_DATA);
    removeCookie(StorageKeys.AUTH_TOKEN);
    removeCookie(StorageKeys.PRODUCT_CATEGORY);
    removeCookie(StorageKeys.PATIENTID);
    removeCookie("XSRF-TOKEN");

    Object.values(LEGACY_LOCAL_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  },
};
