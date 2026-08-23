import { apiRequest } from "./http";
import type { AuthUser } from "@/lib/types";

export interface LoginResponse {
  // Backend contract confirms role resolution happens after OTP verify, not
  // at login — login only confirms credentials and triggers the OTP send.
  message?: string;
}

export interface VerifyOtpResponse {
  accessToken: string;
  user: AuthUser;
}

export function login(employeeCode: string, password: string) {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: { employeeCode, password },
  });
}

export function verifyOtp(employeeCode: string, otp: string) {
  return apiRequest<VerifyOtpResponse>("/auth/verify-otp", {
    method: "POST",
    body: { employeeCode, otp },
  });
}

export function resendOtp(employeeCode: string) {
  return apiRequest<{ message?: string }>("/auth/resend-otp", {
    method: "POST",
    body: { employeeCode },
  });
}

export function getMe() {
  return apiRequest<AuthUser>("/account/me");
}

export function changePassword(currentPassword: string, newPassword: string) {
  return apiRequest<{ message?: string }>("/account/change-password", {
    method: "POST",
    body: { currentPassword, newPassword },
  });
}

export function updateNotificationPrefs(prefs: { push?: boolean; email?: boolean }) {
  return apiRequest<AuthUser>("/account/notification-prefs", {
    method: "PATCH",
    body: prefs,
  });
}
