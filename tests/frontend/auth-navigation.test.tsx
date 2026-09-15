import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AppShell } from "../../components/layout/AppShell";
import { Sidebar } from "../../components/layout/Sidebar";
import {
  AuthState,
  ForbiddenAuthState,
  resolveAuthenticatedState,
  runSignOut,
} from "../../features/auth/AuthState";
import type { AuthUser } from "../../features/auth/auth-types";

const plannedDestinations = [
  "/user/dashboard",
  "/user/graduation-upload",
  "/user/reference-selection",
  "/admin/dashboard",
  "/admin/import/sitasi",
  "/admin/import/certiport",
  "/admin/reference-batches",
  "/admin/matching-rules",
  "/admin/users",
  "/admin/audit-logs",
];

const user: AuthUser = {
  id: "user-1",
  email: "operator@example.test",
  displayName: "Operator",
  role: "USER",
};

const admin: AuthUser = {
  id: "admin-1",
  email: "admin@example.test",
  displayName: "Administrator",
  role: "ADMIN",
};

describe("role-aware navigation", () => {
  it.each(["USER", "ADMIN"] as const)(
    "does not render planned %s navigation before those pages exist",
    (role) => {
      const markup = renderToStaticMarkup(
        <Sidebar role={role} activeRouteLabel="Workspace terlindungi" />,
      );

      for (const destination of plannedDestinations) {
        expect(markup).not.toContain(`href="${destination}"`);
      }
      expect(markup).toContain('aria-label="Navigasi utama"');
    },
  );

  it("does not expose protected children or admin navigation in a forbidden state", () => {
    const markup = renderToStaticMarkup(
      <AuthState state={{ status: "forbidden" }} onSignOut={vi.fn()}>
        <Sidebar role="ADMIN" activeRouteLabel="Dashboard administrator" />
      </AuthState>,
    );

    expect(markup).toContain("Akses tidak diizinkan");
    expect(markup).not.toContain("/admin/");
  });

  it("keeps the current role visible in the authenticated shell", () => {
    const markup = renderToStaticMarkup(
      <AppShell role="USER" activeRouteLabel="Workspace terlindungi" onSignOut={vi.fn()}>
        <p>Konten utama</p>
      </AppShell>,
    );

    expect(markup).toContain("Peran saat ini");
    expect(markup).toContain("User");
    expect(markup).toContain("Workspace terlindungi");
  });

  it("forbids a USER session on an admin pathname", () => {
    expect(resolveAuthenticatedState(user, "/admin/dashboard")).toEqual({
      status: "forbidden",
    });
  });

  it("forbids an ADMIN session on a user pathname", () => {
    expect(resolveAuthenticatedState(admin, "/user/dashboard")).toEqual({
      status: "forbidden",
    });
  });

  it("keeps a matching role authenticated", () => {
    expect(resolveAuthenticatedState(user, "/user/dashboard")).toEqual({
      status: "authenticated",
      user,
    });
  });

  it("keeps the mobile menu labelled even when no feature links are implemented", () => {
    const markup = renderToStaticMarkup(
      <Sidebar role="USER" activeRouteLabel="Workspace terlindungi" />,
    );

    expect(markup).toContain('<button type="button"');
    expect(markup).toContain('aria-controls="app-navigation"');
    expect(markup).toContain('aria-expanded="false"');
    expect(markup).toContain("Buka menu navigasi");
    expect(markup).toContain('<nav id="app-navigation" aria-label="Navigasi utama"');
  });

  it("returns a perceivable error message when forbidden sign-out rejects", async () => {
    const result = await runSignOut(() => Promise.reject(new Error("Session provider gagal.")));

    expect(result).toBe("Session provider gagal.");
    const markup = renderToStaticMarkup(
      <ForbiddenAuthState
        onSignOut={vi.fn()}
        signOutError={result}
      />,
    );
    expect(markup).toContain('role="alert"');
    expect(markup).toContain("Session provider gagal.");
  });
});
