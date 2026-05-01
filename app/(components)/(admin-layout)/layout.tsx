"use client";
import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

const ADMIN_SESSION_KEY = "siladocs_admin_session";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const bodyRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    bodyRef.current = document.body;
    bodyRef.current.classList.add("authentication-background");
    return () => {
      bodyRef.current?.classList.remove("authentication-background");
    };
  }, []);

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
    const isLoginPage = pathname === "/admin/login";

    if (!isAuthenticated && !isLoginPage) {
      router.replace("/admin/login");
    } else if (isAuthenticated && isLoginPage) {
      router.replace("/admin/backoffice");
    }
  }, [pathname, router]);

  return <>{children}</>;
}
