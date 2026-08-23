"use client";

import Cookies from "js-cookie";
import type { UserRole } from "./enums";

const TOKEN_KEY = "rsl_token";
const ROLE_KEY = "rsl_role";
const CODE_KEY = "rsl_pending_code"; // used only between login and OTP step

// NOTE ON SECURITY TRADEOFF:
// The most secure pattern is an httpOnly cookie set by a Next.js Route
// Handler acting as a BFF proxy for every backend call, so the JWT never
// touches client JS at all. That's a larger architectural piece (a proxy
// route per resource) than this build includes. As a middle ground, the
// token is kept in a cookie (not localStorage) so `middleware.ts` can still
// guard routes server-side on navigation, with SameSite=Lax and Secure (in
// production) set. If/when the BFF proxy is added later, only this file and
// lib/api/http.ts need to change — no page code depends on how the token is
// stored.

export function setSession(token: string, role: UserRole) {
  const isProd = process.env.NODE_ENV === "production";
  Cookies.set(TOKEN_KEY, token, { expires: 1, sameSite: "lax", secure: isProd });
  Cookies.set(ROLE_KEY, role, { expires: 1, sameSite: "lax", secure: isProd });
  Cookies.remove(CODE_KEY);
}

export function getToken(): string | undefined {
  return Cookies.get(TOKEN_KEY);
}

export function getRole(): UserRole | undefined {
  return Cookies.get(ROLE_KEY) as UserRole | undefined;
}

export function clearSession() {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(ROLE_KEY);
}

export function setPendingEmployeeCode(code: string) {
  Cookies.set(CODE_KEY, code, { expires: 1 / 24 }); // 1 hour, just enough for the OTP step
}

export function getPendingEmployeeCode(): string | undefined {
  return Cookies.get(CODE_KEY);
}

export function roleHomePath(role?: UserRole | string): string {
  switch (role) {
    case "ADMIN":
      return "/admin/home";
    case "DISPATCHER":
      return "/dispatcher/queue";
    case "ACCOUNTS":
      return "/accounts/bills";
    default:
      return "/login";
  }
}
