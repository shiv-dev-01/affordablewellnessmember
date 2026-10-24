# happylabco Cookie-Based Authentication Migration

This document describes the frontend changes made to move from **localStorage `login_token` + `Authorization` header** auth to **HttpOnly session cookies** with `withCredentials`.

---

## Summary

| Before | After |
|--------|-------|
| `login_token` stored in `localStorage` | Session stored in HttpOnly cookie (`happylabco_session`) by backend |
| `Authorization: login_token` on every API call | Session cookie sent automatically via `withCredentials: true` |
| User data in `localStorage` | User data in client cookies (`happylabco_*`) |
| Logout via `/expire-token` | Logout via `/user_logout` |
| Duplicate `hooks/useAuth.ts` + `AuthProvider` | Single `AuthProvider` + `useAuth` |

---

## New / Updated Files

### Environment (`.env.development`, `.env.production`)

| Variable | Development | Production |
|----------|-------------|------------|
| `VITE_happylabco_API_PATH` | `/happylabco_token_proxy` | `/happylabco_token` |
| `VITE_API_HOST` | `https://panel.whitelabelmd.com` | `https://panel.whitelabelmd.com` |
| `VITE_USE_DEV_PROXY` | `true` | `false` |
| `VITE_API_SAME_ORIGIN` | `false` | `false` |

Set `VITE_API_SAME_ORIGIN=true` in production when nginx on the frontend domain proxies `/happylabco_token` to the backend.

### Vite proxy (`vite.config.ts`)

- Proxies `VITE_happylabco_API_PATH` → `VITE_API_HOST` in local dev
- Rewrites cookie domain/path so session cookies work on `localhost`

### Cookie utilities (`src/utils/cookies.ts`) — **NEW**

- `setCookie(name, value, maxAgeSec)` — `path=/`, `SameSite=Lax`, `Secure` on HTTPS
- `getCookie(name)`
- `removeCookie(name)`

### Storage layer (`src/utils/storage.ts`)

Client-side data now uses `happylabco_`-prefixed cookies:

| Cookie name | Purpose |
|-------------|---------|
| `happylabco_userData` | Logged-in user profile (JSON) |
| `happylabco_authToken` | Chat API token (request body, not session) |
| `happylabco_patientId` | Patient ID |
| `happylabco_productCategory` | Product category |

**Removed:** `login_token` storage (no `setLoginToken` / `getLoginToken`).

**Migration:** On first load, copies legacy `localStorage` keys (`userData`, `authToken`, etc.) into cookies and deletes them.

**`clearAuth()`** removes all `happylabco_*` cookies, `XSRF-TOKEN`, and legacy `localStorage` keys.

### API config (`src/services/api/config.ts`)

- `API_ORIGIN` built from env (dev proxy vs production host)
- Main `api` instance: `withCredentials: true`, XSRF cookie support
- **Removed** request interceptor that set `Authorization: login_token`
- **Added** response interceptor: on `401`, `419`, or expired-session messages → `clearAuth()` + redirect to `/login`
- **Added** `ensureCsrfCookieIfNeeded()` — called before login in dev when proxy is enabled
- **Added** `happylabcoLegacyApi` for `/happylabco/api/*` endpoints
- All axios instances use env-based `PANEL_ORIGIN` instead of hardcoded URLs

### Auth service (`src/services/auth.ts`)

- `loginUser()` — unchanged endpoint; does **not** save `login_token` from response
- **Added** `logoutUser(email)` → `POST /user_logout`
- **Removed** `expireToken()` and manual `Authorization` headers

### Auth provider (`src/providers/AuthProvider.tsx`)

- `isAuthenticated` = `!!storage.getUserData()?.email` on mount
- **Added** `isLoading` for `ProtectedRoute`
- Login success: stores user data + chat token only (no `login_token`)
- Logout: calls `logoutUser` — clears cookies **only** if API returns `status === 1`
- Calls `ensureCsrfCookieIfNeeded()` before login in dev

### Protected route (`src/components/auth/ProtectedRoute.tsx`)

- Uses `useAuth` from `AuthProvider` (not deleted `hooks/useAuth`)
- Waits for `isLoading` before redirecting

### Layout / Header

- Import `useAuth` from `providers/AuthProvider`
- Layout widget load no longer checks `getLoginToken()`

### Chat service (`src/services/api/chat.ts`)

- **Removed** `getPanelAuthHeaders()` and `loginToken` requirement
- Session cookie handles panel API auth; chat `token` still sent in request body

### Cart service (`src/services/api/cart.ts`)

- `getUserCartProductsV2` uses `api.post('/get_user_cart_products_v2')` instead of hardcoded URL
- `getLabPdfFile` uses `happylabcoLegacyApi`
- `getOrderIntakeData` uses `whitelabelApi180`

### Other callers updated to use axios instances

| File | Change |
|------|--------|
| `QuickActions.tsx` | `api.post('/subscription_stop')` |
| `OrderInfo.tsx` | `api.get('/order-status?...')` |
| `CheckInForms.tsx` | `happylabcoLegacyApi` + `whitelabelApi180` |
| `ChangePassword.tsx` | No longer stores `login_token` |

### Removed

- `src/hooks/useAuth.ts` (duplicate auth hook)

### TypeScript env types (`src/vite-env.d.ts`)

- Added `ImportMetaEnv` for Vite env variables

---

## What Was NOT Changed

- Login UI components and form logic
- Tour / `neverShowTour` localStorage (non-auth)
- Location API localStorage cache
- `CartProducts.tsx` phan-dev URLs (external dev endpoints)
- Stripe keys (not in scope)
- Backend configuration

---

## Local Development

1. `npm run dev`
2. API requests go to `http://localhost:PORT/happylabco_token_proxy/api/...`
3. Vite proxy forwards to `https://panel.whitelabelmd.com/happylabco_token`
4. Session cookies are rewritten for localhost

## Production

- API requests go to `https://panel.whitelabelmd.com/happylabco_token/api/...`
- Or same-origin if nginx proxies and `VITE_API_SAME_ORIGIN=true`

---

## Test Checklist

- [ ] Login → Network shows `Set-Cookie: happylabco_session` (HttpOnly) from backend
- [ ] No `login_token` in `localStorage`
- [ ] `happylabco_userData` cookie set after login
- [ ] Protected API works **without** `Authorization` header
- [ ] Logout → `user_logout` returns `status: 1` → client cookies cleared
- [ ] `401` on protected route → redirect to `/login`
- [ ] Local dev: requests use `/happylabco_token_proxy/api/...`
- [ ] Production: requests use `panel.whitelabelmd.com/happylabco_token/api/...`

---

## Backend Requirements (for backend team)

The frontend expects the backend to:

1. Set an HttpOnly session cookie on successful `POST /user_login`
2. Validate session cookie on protected routes (no `Authorization: login_token` header)
3. Expose `POST /user_logout` returning `{ status: 1 }` on success
4. Enable CORS with `supports_credentials: true` and exact frontend origin
5. For cross-domain: `SESSION_SAME_SITE=none`, `SESSION_SECURE_COOKIE=true`, `SANCTUM_STATEFUL_DOMAINS` including frontend host
