import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AppShell } from "../../components/layout/AppShell";
import { Sidebar } from "../../components/layout/Sidebar";
import { AuthState } from "../../features/auth/AuthState";

const userDestinations = [
  "/user/dashboard",
  "/user/graduation-upload",
  "/user/reference-selection",
];

const adminDestinations = [
  "/admin/dashboard",
  "/admin/import/sitasi",
  "/admin/import/certiport",
  "/admin/reference-batches",
  "/admin/matching-rules",
  "/admin/users",
  "/admin/audit-logs",
];

describe("role-aware navigation", () => {
  it("renders only USER destinations for an operator", () => {
    const markup = renderToStaticMarkup(
      <Sidebar role="USER" activeRouteLabel="Dashboard operasional" />,
    );

    for (const destination of userDestinations) {
      expect(markup).toContain(`href="${destination}"`);
    }
    for (const destination of adminDestinations) {
      expect(markup).not.toContain(`href="${destination}"`);
    }
  });

  it("renders every confirmed ADMIN destination without USER destinations", () => {
    const markup = renderToStaticMarkup(
      <Sidebar role="ADMIN" activeRouteLabel="Dashboard administrator" />,
    );

    for (const destination of adminDestinations) {
      expect(markup).toContain(`href="${destination}"`);
    }
    for (const destination of userDestinations) {
      expect(markup).not.toContain(`href="${destination}"`);
    }
  });

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
      <AppShell
        role="USER"
        activeRouteLabel="Dashboard operasional"
        onSignOut={vi.fn()}
      >
        <p>Konten utama</p>
      </AppShell>,
    );

    expect(markup).toContain("Peran saat ini");
    expect(markup).toContain("User");
    expect(markup).toContain("Dashboard operasional");
  });

  it("uses a labelled button and native navigation semantics for the mobile menu", () => {
    const markup = renderToStaticMarkup(
      <Sidebar role="USER" activeRouteLabel="Dashboard operasional" />,
    );

    expect(markup).toContain('<button type="button"');
    expect(markup).toContain('aria-controls="app-navigation"');
    expect(markup).toContain('aria-expanded="false"');
    expect(markup).toContain("Buka menu navigasi");
    expect(markup).toContain('<nav id="app-navigation" aria-label="Navigasi utama"');
    expect(markup).toMatch(/<a[^>]+href="\/user\/dashboard"/);
  });
});
