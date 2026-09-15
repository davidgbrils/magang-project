"use client";

import { usePathname } from "next/navigation";
import React from "react";
import { ProtectedAuthBoundary } from "../../features/auth/AuthState";

export default function ProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  return <ProtectedAuthBoundary pathname={pathname}>{children}</ProtectedAuthBoundary>;
}
