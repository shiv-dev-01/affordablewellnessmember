function cookieFlags(): string {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  return `; path=/; SameSite=Lax${secure}`;
}

export function setCookie(
  name: string,
  value: string,
  maxAgeSec = 8 * 60 * 60,
): void {
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; max-age=${maxAgeSec}${cookieFlags()}`;
}

export function getCookie(name: string): string | null {
  const escaped = encodeURIComponent(name).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${escaped}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export function removeCookie(name: string): void {
  document.cookie = `${encodeURIComponent(name)}=; max-age=0${cookieFlags()}`;
}
