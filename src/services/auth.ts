import axios from "axios";
import type { LoginResponse, PortalLoginWithTokenResponse } from "../types/auth";
import { api } from "./api/config";

export const PORTAL_LOGIN_WITH_TOKEN_URL = import.meta.env.DEV
  ? "/affordablewellness/api/portal/login-with-token"
  : "https://panel.whitelabelmd.com/affordablewellness/api/portal/login-with-token";

export const PORTAL_LINK_EXPIRED_MESSAGE =
  "This portal link is invalid or expired.";

export const loginWithToken = async (
  loginToken: string,
): Promise<PortalLoginWithTokenResponse> => {
  try {
    const response = await axios.post<PortalLoginWithTokenResponse>(
      PORTAL_LOGIN_WITH_TOKEN_URL,
      { login_token: loginToken },
      { headers: { "Content-Type": "application/json" } },
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data) {
      const data = error.response.data as PortalLoginWithTokenResponse;
      if (data && typeof data === "object") {
        return {
          status: typeof data.status === "number" ? data.status : 0,
          message: data.message || PORTAL_LINK_EXPIRED_MESSAGE,
          data: data.data,
        };
      }
    }
    return {
      status: 0,
      message: PORTAL_LINK_EXPIRED_MESSAGE,
    };
  }
};

export const loginUser = async (
  email: string,
  password: string,
  isMagic?: boolean,
): Promise<LoginResponse> => {
  try {
    const payload: Record<string, string | number> = {
      email,
      password,
    };

    if (isMagic) {
      payload.is_magic = 1;
    }

    const response = await api.post("/user_login", payload);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const logoutUser = async (
  email: string,
): Promise<{ status?: number; message?: string }> => {
  try {
    const response = await api.post("/user_logout", { email });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data;
    }
    throw error;
  }
};

export const changePassword = async (
  email: string,
  oldPassword: string,
  newPassword: string,
): Promise<LoginResponse> => {
  try {
    const response = await api.post("/change_password_new", {
      email,
      old_password: oldPassword,
      password: newPassword,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const getUserPassword = async (
  email: string,
): Promise<{ password: string; status: number; message: string }> => {
  try {
    const response = await api.post("/get_user_password", {
      email,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const updatePassword = async ({
  userId,
  email,
  oldPassword,
  newPassword,
}: {
  userId: number;
  email: string;
  oldPassword: string;
  newPassword: string;
}): Promise<{ status: number; message: string }> => {
  try {
    const response = await api.post("/change_password", {
      user_id: userId,
      email,
      password: newPassword,
      old_password: oldPassword,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};
