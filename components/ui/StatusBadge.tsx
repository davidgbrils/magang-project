import React, { type ReactNode } from "react";

export type StatusTone = "success" | "warning" | "danger" | "neutral";

export interface StatusBadgeProps {
  tone?: StatusTone;
  children: ReactNode;
}

export function StatusBadge({ tone = "neutral", children }: StatusBadgeProps) {
  return (
    <span className="ui-status-badge" data-tone={tone}>
      {children}
    </span>
  );
}
