"use client";

import Link from "next/link";
import React, { useState } from "react";
import type { UserRole } from "../../features/auth/auth-types";

type NavigationItem = {
  href: string;
  label: string;
};

const PLANNED_NAVIGATION_BY_ROLE: Record<UserRole, readonly NavigationItem[]> = {
  USER: [
    { href: "/user/dashboard", label: "Dashboard operasional" },
    { href: "/user/graduation-upload", label: "Upload berkas wisuda" },
    { href: "/user/reference-selection", label: "Pilih batch referensi" },
  ],
  ADMIN: [
    { href: "/admin/dashboard", label: "Dashboard administrator" },
    { href: "/admin/import/sitasi", label: "Import SITASI" },
    { href: "/admin/import/certiport", label: "Import Certiport" },
    { href: "/admin/reference-batches", label: "Batch referensi" },
    { href: "/admin/matching-rules", label: "Aturan matching" },
    { href: "/admin/users", label: "Pengguna dan peran" },
    { href: "/admin/audit-logs", label: "Audit log" },
  ],
};

// Route tasks add a path here only when its page exists in the app tree.
export const IMPLEMENTED_PROTECTED_ROUTES: readonly string[] = [
  "/user/dashboard",
  "/user/graduation-upload",
  "/user/file-validation",
  "/user/reference-selection",
  "/user/synchronization/[id]/progress",
  "/user/synchronization/[id]/preview",
  "/user/synchronization/[id]/review",
  "/user/synchronization/[id]/output",
];

export const NAVIGATION_BY_ROLE: Record<UserRole, readonly NavigationItem[]> = {
  USER: PLANNED_NAVIGATION_BY_ROLE.USER.filter((item) =>
    IMPLEMENTED_PROTECTED_ROUTES.includes(item.href),
  ),
  ADMIN: PLANNED_NAVIGATION_BY_ROLE.ADMIN.filter((item) =>
    IMPLEMENTED_PROTECTED_ROUTES.includes(item.href),
  ),
};

export interface SidebarProps {
  role: UserRole;
  activeRouteLabel: string;
}

export function Sidebar({ role, activeRouteLabel }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigationItems = NAVIGATION_BY_ROLE[role];

  return (
    <aside className="app-sidebar">
      <div className="app-sidebar__identity">
        <span aria-hidden="true" className="app-sidebar__mark">ITCC</span>
        <span>Wisuda Sync</span>
      </div>
      <button
        type="button"
        className="app-sidebar__menu-button"
        aria-controls="app-navigation"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
        onClick={() => setIsOpen((current) => !current)}
      >
        Menu
      </button>
      <nav
        id="app-navigation"
        aria-label="Navigasi utama"
        className="app-sidebar__navigation"
        data-mobile-open={isOpen}
      >
        <ul>
          {navigationItems.map((item) => {
            const isActive = item.label === activeRouteLabel;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
