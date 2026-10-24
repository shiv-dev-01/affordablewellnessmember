import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Logo } from "../components/layout/Logo";
import { LoadingBar } from "../components/ui/LoadingBar";
import { API_ORIGIN, ensureCsrfCookieIfNeeded } from "../services/api/config";
import { getUserProfileData } from "../services/api/user";
import type { LoginResponse } from "../types/auth";
import { getCookie } from "../utils/cookies";
import { storage } from "../utils/storage";

/**
 * Auth0Callback
 *
 * Mount this at /auth0-callback. After Google/Apple login completes,
 * Auth0 sends the browser here. This calls the panel bridge_to_session
 * endpoint so httponly session cookies are set on this app's API origin.
 */
const BRIDGE_TO_SESSION_ENDPOINT = `${API_ORIGIN}/api/auth0/bridge_to_session`;

async function persistBridgeSession(
  data: LoginResponse,
  auth0Email?: string,
): Promise<boolean> {
  const email = data.email || auth0Email;
  if (!email) {
    return false;
  }

  if (data.token && data.token.trim() !== "") {
    storage.setAuthToken(data.token);
  }

  let userId = data.user_id || 0;
  let firstName = data.first_name || "";
  let lastName = data.last_name || "";
  let phoneNumber = data.phone_number || "";
  let patientId = data.patientId || "";
  let gender = data.gender || "";
  const existing = data.existing || 0;

  storage.setUserData({
    userId,
    email,
    firstName,
    lastName,
    phoneNumber,
    patientId,
    gender,
    existing,
  });

  if (patientId) {
    storage.setPatientId(patientId);
  }

  if (!data.user_id || !data.first_name || !data.last_name) {
    try {
      const profile = await getUserProfileData(userId);
      const details = profile.user_details;
      if (details) {
        userId = userId || details.id || 0;
        firstName = firstName || details.first_name || "";
        lastName = lastName || details.last_name || "";
        phoneNumber = phoneNumber || details.phone_number || "";
        gender = gender || details.gender || "";

        storage.setUserData({
          userId,
          email,
          firstName,
          lastName,
          phoneNumber,
          patientId,
          gender,
          existing,
        });
      }
    } catch {
      // Email is enough for AuthProvider; profile fill is best-effort.
    }
  }

  return true;
}

export function Auth0Callback() {
  const { isAuthenticated, isLoading, getAccessTokenSilently, error, user } =
    useAuth0();
  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const startedRef = useRef(false);

  useEffect(() => {
    if (isLoading) return;

    if (error) {
      setStatus("error");
      setErrorMessage(error.message || "Login failed.");
      return;
    }

    if (!isAuthenticated) {
      setStatus("error");
      setErrorMessage("Not authenticated.");
      return;
    }

    if (startedRef.current) return;
    startedRef.current = true;

    (async () => {
      try {
        const accessToken = await getAccessTokenSilently();

        await ensureCsrfCookieIfNeeded();
        const xsrf = getCookie("XSRF-TOKEN");

        const res = await fetch(BRIDGE_TO_SESSION_ENDPOINT, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            ...(xsrf ? { "X-XSRF-TOKEN": xsrf } : {}),
          },
          credentials: "include",
        });

        const data = (await res.json()) as LoginResponse;

        if (data.status === 1) {
          const persisted = await persistBridgeSession(data, user?.email);
          if (!persisted) {
            setStatus("error");
            setErrorMessage("Unable to complete sign in.");
            return;
          }
          setStatus("success");
          window.location.href = "/dashboard";
        } else {
          setStatus("error");
          setErrorMessage(data.message || "Unable to sign in.");
        }
      } catch {
        setStatus("error");
        setErrorMessage("Network error. Please try again.");
      }
    })();
  }, [
    isLoading,
    isAuthenticated,
    error,
    getAccessTokenSilently,
    user?.email,
  ]);

  return (
    <>
      <LoadingBar isLoading={status === "loading"} />
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Logo />
          </div>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 mt-4 text-center">
            {status === "loading" && (
              <p className="text-sm text-gray-600">Signing you in...</p>
            )}
            {status === "error" && (
              <>
                <p className="text-sm text-red-600">{errorMessage}</p>
                <Link
                  to="/login"
                  className="mt-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  Back to login
                </Link>
              </>
            )}
            {status === "success" && (
              <p className="text-sm text-gray-600">Success! Redirecting...</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
