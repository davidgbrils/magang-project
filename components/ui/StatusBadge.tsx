import React from "react";

export type StatusTone = "success" | "warning" | "danger" | "neutral";

export interface StatusBadgeProps {
  tone?: StatusTone;
  label: string;
}

export function StatusBadge({ tone = "neutral", label }: StatusBadgeProps) {
  if (!label.trim()) {
    throw new Error("StatusBadge membutuhkan label teks.");
  }

  return (
    <span className="ui-status-badge" data-tone={tone}>
      {label}
    </span>
  );
}
