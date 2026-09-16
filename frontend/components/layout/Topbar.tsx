"use client";

import React, { useState } from "react";
import type { UserRole } from "../../features/auth/auth-types";
import { Button } from "../ui/Button";

export interface TopbarProps {
  role: UserRole;
  activeRouteLabel: string;
  onSignOut: () => void | Promise<void>;
}

export function Topbar({ role, activeRouteLabel, onSignOut }: TopbarProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  async function handleSignOut() {
    setIsSigningOut(true);
    setSignOutError(null);

    try {
      await onSignOut();
    } catch (error) {
      setSignOutError(error instanceof Error ? error.message : "Gagal keluar dari sistem.");
      setIsSigningOut(false);
    }
  }

  return (
    <header className="app-topbar">
      <div className="app-topbar__context">
        <span className="app-topbar__mobile-product">ITCC Wisuda Sync</span>
        <strong>{activeRouteLabel}</strong>
      </div>
      <div className="app-topbar__session">
        <span>
          <span className="ui-visually-hidden">Peran saat ini: </span>
          {role === "ADMIN" ? "Admin" : "User"}
        </span>
        <Button variant="quiet" loading={isSigningOut} onClick={handleSignOut}>
          Keluar
        </Button>
      </div>
      {signOutError ? <p className="app-topbar__error" role="alert">{signOutError}</p> : null}
    </header>
  );
}
