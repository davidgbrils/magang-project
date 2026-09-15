import React, { type ReactNode } from "react";
import type { UserRole } from "../../features/auth/auth-types";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export interface AppShellProps {
  role: UserRole;
  activeRouteLabel: string;
  onSignOut: () => void | Promise<void>;
  children: ReactNode;
}

export function AppShell({ role, activeRouteLabel, onSignOut, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <Sidebar role={role} activeRouteLabel={activeRouteLabel} />
      <div className="app-shell__workspace">
        <Topbar role={role} activeRouteLabel={activeRouteLabel} onSignOut={onSignOut} />
        <main className="app-shell__content" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
