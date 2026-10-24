import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  loginUser,
  loginWithToken,
  getUserPassword,
  logoutUser,
  PORTAL_LINK_EXPIRED_MESSAGE,
} from "../services/auth";
import { ensureCsrfCookieIfNeeded } from "../services/api/config";
import { storage } from "../utils/storage";
import { destroyLeadConnectorWidget } from "../utils/chatWidget";
import type { LoginResponse } from "../types/auth";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  loginWithMagicLink: (email: string) => Promise<void>;
  loginWithPortalToken: (loginToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout: auth0Logout, isAuthenticated: isAuth0Authenticated } =
    useAuth0();

  useEffect(() => {
    setIsAuthenticated(!!storage.getUserData()?.email);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (isAuthenticated) {
      const hasPortalLoginToken = new URLSearchParams(location.search).get(
        "login_token",
      );
      if (location.pathname === "/login" && !hasPortalLoginToken) {
        navigate("/dashboard");
      }
    } else if (
      location.pathname !== "/login" &&
      location.pathname !== "/change-password" &&
      location.pathname !== "/auth0-callback"
    ) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, location.pathname, location.search, navigate]);

  const handleLoginSuccess = (response: LoginResponse) => {
    if (
      !response.user_id ||
      !response.email ||
      !response.first_name ||
      !response.last_name
    ) {
      throw new Error("Missing required authentication data");
    }

    if (response.token?.trim()) {
      storage.setAuthToken(response.token);
    }

    const userData = {
      userId: response.user_id,
      email: response.email,
      firstName: response.first_name,
      lastName: response.last_name,
      phoneNumber: response.phone_number || "",
      patientId: response.patientId || "",
      gender: response.gender || "",
      existing: response.existing || 0,
    };

    storage.setUserData(userData);

    if (response.patientId) {
      storage.setPatientId(response.patientId);
    }

    setIsAuthenticated(true);
  };

  const login = async (credentials: { email: string; password: string }) => {
    try {
      await ensureCsrfCookieIfNeeded();
      const response = await loginUser(credentials.email, credentials.password);

      if (response.status === 0) {
        throw new Error(response.message);
      }

      if (response.status === 3 && response.error_code === "4010") {
        navigate("/change-password", {
          state: {
            email: credentials.email,
            tempPassword: response.password,
          },
        });
        return;
      }

      if (response.status === 1) {
        handleLoginSuccess(response);
        return;
      }

      throw new Error(response.message);
    } catch (error: unknown) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const loginWithPortalToken = async (loginToken: string) => {
    try {
      const response = await loginWithToken(loginToken);

      if (response.status !== 1 || !response.data) {
        throw new Error(response.message || PORTAL_LINK_EXPIRED_MESSAGE);
      }

      const user = response.data;
      const mustChangePassword =
        user.must_change_password === 1 || user.must_change_password === true;

      if (mustChangePassword && user.password && user.email) {
        navigate("/change-password", {
          state: {
            email: user.email,
            tempPassword: user.password,
          },
        });
        return;
      }

      handleLoginSuccess({
        status: 1,
        message: response.message || "Success",
        user_id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number,
        token: user.token,
        patientId: user.patientId,
        gender: user.gender,
        existing: user.existing,
      });
      navigate("/dashboard");
    } catch (error: unknown) {
      console.error("Portal token login failed:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(PORTAL_LINK_EXPIRED_MESSAGE);
    }
  };

  const loginWithMagicLink = async (email: string) => {
    try {
      await ensureCsrfCookieIfNeeded();

      const passwordResponse = await getUserPassword(email);

      if (passwordResponse.status !== 1) {
        throw new Error(
          passwordResponse.message || "Failed to get user password",
        );
      }

      const response = await loginUser(email, passwordResponse.password, true);

      if (response.status === 0) {
        throw new Error(response.message);
      }

      if (response.status === 3 && response.error_code === "4010") {
        navigate("/change-password", {
          state: {
            email,
            tempPassword: response.password,
          },
        });
        return;
      }

      if (response.status === 1) {
        handleLoginSuccess(response);
        return;
      }

      throw new Error(response.message);
    } catch (error: unknown) {
      console.error("Magic link login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    const userEmail = storage.getUserData()?.email;

    if (userEmail) {
      try {
        await logoutUser(userEmail);
      } catch (error) {
        console.warn("Logout API failed:", error);
      }
    }

    destroyLeadConnectorWidget();

    storage.clearAuth();
    setIsAuthenticated(false);

    if (isAuth0Authenticated) {
      auth0Logout({ openUrl: false });
    }

    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login,
        loginWithMagicLink,
        loginWithPortalToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
