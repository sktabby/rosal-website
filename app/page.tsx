"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useSession } from "@/providers/SessionProvider";
import { clearSession, hasWebPortal, roleHomePath } from "@/lib/session";

// Static export has no server left to run middleware, so "/" resolves its
// redirect here on the client instead — same destinations middleware used.
export default function RootPage() {
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
    router.replace(roleHomePath(user.role));
  }, [loading, user, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-rsl-bg">
      <Loader2 className="h-6 w-6 animate-spin text-rsl-red" />
    </div>
  );
}
