"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/providers/SessionProvider";
import { clearSession, hasWebPortal, roleHomePath } from "@/lib/session";
import type { UserRole } from "@/lib/enums";

/**
 * Client-side replacement for middleware.ts's route protection (removed for
 * static export, which runs no server to execute middleware on navigation).
 * Mirrors its exact redirect behavior: require login, require a role with a
 * web portal, and require the specific role this section is gated to.
 */
export function useRoleGuard(requiredRole: UserRole) {
  const { user, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!hasWebPortal(user.role)) {
      clearSession();
      router.replace("/login?reason=no-portal-access");
      return;
    }
    if (user.role !== requiredRole) {
      router.replace(roleHomePath(user.role));
    }
  }, [loading, user, requiredRole, router]);

  const authorized = !loading && !!user && user.role === requiredRole;
  return { user, loading, authorized };
}

/**
 * Same as useRoleGuard but for pages shared across every role with a web
 * portal (e.g. change-password) — only requires being logged in with a
 * valid portal role, not a specific one.
 */
export function useAuthGuard() {
  const { user, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!hasWebPortal(user.role)) {
      clearSession();
      router.replace("/login?reason=no-portal-access");
    }
  }, [loading, user, router]);

  const authorized = !loading && !!user && hasWebPortal(user.role);
  return { user, loading, authorized };
}
