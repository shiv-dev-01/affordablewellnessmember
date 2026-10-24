import { useAuth0 } from "@auth0/auth0-react";

/**
 * AppleLoginButton
 *
 * Sends the user straight to Apple sign-in via Auth0's Apple connection.
 */
export function AppleLoginButton() {
  const { loginWithRedirect, isLoading } = useAuth0();

  const handleAppleLogin = () => {
    loginWithRedirect({
      authorizationParams: {
        connection: "apple",
      },
    });
  };

  return (
    <button
      type="button"
      onClick={handleAppleLogin}
      disabled={isLoading}
      className="w-full bg-black hover:bg-gray-900 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-3 shadow-sm hover:shadow disabled:opacity-50"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M16.365 1.43c0 1.14-.42 2.2-1.18 3.05-.79.9-2.08 1.59-3.32 1.5-.13-1.1.4-2.24 1.16-3.08.8-.89 2.16-1.54 3.34-1.47zM20.5 17.13c-.54 1.25-.8 1.8-1.5 2.9-1.02 1.52-2.45 3.41-4.23 3.43-1.57.03-1.98-1.02-4.12-1.01-2.15.01-2.6 1.04-4.17 1.01-1.78-.03-3.13-1.72-4.15-3.24C.3 16.9-.74 12.3.86 9.16c1.12-2.2 3.1-3.49 4.89-3.49 1.82 0 2.96 1.06 4.46 1.06 1.45 0 2.33-1.06 4.47-1.06 1.59 0 3.27 1.03 4.38 2.81-3.84 2.1-3.22 7.58.44 8.65z" />
      </svg>
      {isLoading ? "Loading..." : "Sign in with Apple"}
    </button>
  );
}
