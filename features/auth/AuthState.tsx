"use client";

import Link from "next/link";
import React, { useEffect, useState, type ReactNode } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { AsyncState } from "../../components/ui/AsyncState";
import { Button } from "../../components/ui/Button";
import { ApiClientError, request } from "../../lib/api-client";
import type { AuthAdapter, AuthStateValue, AuthUser, UserRole } from "./auth-types";

export interface AuthStateProps {
  state: AuthStateValue;
  onSignOut: () => void | Promise<void>;
  children: ReactNode;
}

export function requiredRoleForPath(pathname: string): UserRole | null {
  if (pathname.startsWith("/admin/")) return "ADMIN";
  if (pathname.startsWith("/user/")) return "USER";
  return null;
}

export function resolveAuthenticatedState(user: AuthUser, pathname: string): AuthStateValue {
  const requiredRole = requiredRoleForPath(pathname);
  return requiredRole && requiredRole !== user.role
    ? { status: "forbidden" }
    : { status: "authenticated", user };
}

export async function runSignOut(onSignOut: () => void | Promise<void>): Promise<string | null> {
  try {
    await onSignOut();
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : "Gagal keluar dari sistem.";
  }
}

export function ForbiddenAuthState({
  onSignOut,
  signOutError: initialError = null,
}: {
  onSignOut: () => void | Promise<void>;
  signOutError?: string | null;
}) {
  const [signOutError, setSignOutError] = useState<string | null>(initialError);
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    setSignOutError(await runSignOut(onSignOut));
    setIsSigningOut(false);
  }

  return (
    <section className="auth-state" aria-labelledby="auth-forbidden-title">
      <h1 id="auth-forbidden-title">Akses tidak diizinkan</h1>
      <p>Peran akun ini tidak memiliki akses ke halaman tersebut.</p>
      <Button variant="secondary" loading={isSigningOut} onClick={handleSignOut}>Keluar dari akun</Button>
      {signOutError ? <p role="alert" className="auth-state__error">{signOutError}</p> : null}
    </section>
  );
}

export function AuthState({ state, onSignOut, children }: AuthStateProps) {
  switch (state.status) {
    case "loading":
      return <AsyncState variant="loading" message="Sesi sedang diperiksa." />;
    case "unauthenticated":
      return (
        <section className="auth-state" aria-labelledby="auth-required-title">
          <h1 id="auth-required-title">Sesi diperlukan</h1>
          <p>Masuk kembali untuk membuka workspace ITCC Wisuda Sync.</p>
          <Link className="auth-state__link" href="/login">Ke halaman login</Link>
        </section>
      );
    case "forbidden":
      return <ForbiddenAuthState onSignOut={onSignOut} />;
    case "error":
      return <AsyncState variant="error" message={state.message} />;
    case "authenticated":
      return <>{children}</>;
  }
}

const apiMeAdapter: AuthAdapter = {
  getCurrentUser: () => request<AuthUser>("/api/me"),
  signOut: () => Promise.reject(new Error("Penyedia sign-out belum dikonfigurasi.")),
};

const routeLabels: Record<string, string> = {
  "/user/dashboard": "Dashboard operasional",
  "/user/graduation-upload": "Upload berkas wisuda",
  "/user/reference-selection": "Pilih batch referensi",
  "/admin/dashboard": "Dashboard administrator",
  "/admin/import/sitasi": "Import SITASI",
  "/admin/import/certiport": "Import Certiport",
  "/admin/reference-batches": "Batch referensi",
  "/admin/matching-rules": "Aturan matching",
  "/admin/users": "Pengguna dan peran",
  "/admin/audit-logs": "Audit log",
};

export interface ProtectedAuthBoundaryProps {
  children: ReactNode;
  pathname?: string;
  adapter?: AuthAdapter;
}

export function ProtectedAuthBoundary({
  children,
  pathname = "",
  adapter = apiMeAdapter,
}: ProtectedAuthBoundaryProps) {
  const [state, setState] = useState<AuthStateValue>({ status: "loading" });

  useEffect(() => {
    let isCurrent = true;

    adapter.getCurrentUser().then(
      (user) => {
        if (isCurrent) setState(resolveAuthenticatedState(user, pathname));
      },
      (error: unknown) => {
        if (!isCurrent) return;
        if (error instanceof ApiClientError && error.status === 401) {
          setState({ status: "unauthenticated" });
        } else if (error instanceof ApiClientError && error.status === 403) {
          setState({ status: "forbidden" });
        } else {
          setState({ status: "error", message: "Sesi gagal diperiksa. Muat ulang halaman untuk mencoba lagi." });
        }
      },
    );

    return () => {
      isCurrent = false;
    };
  }, [adapter, pathname]);

  async function handleSignOut() {
    await adapter.signOut();
    setState({ status: "unauthenticated" });
  }

  const content = state.status === "authenticated" ? (
    <AppShell
      role={state.user.role}
      activeRouteLabel={routeLabels[pathname] ?? "Workspace terlindungi"}
      onSignOut={handleSignOut}
    >
      {children}
    </AppShell>
  ) : null;

  return <AuthState state={state} onSignOut={handleSignOut}>{content}</AuthState>;
}
