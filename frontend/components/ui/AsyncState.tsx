import React, { type ReactNode } from "react";

export type AsyncStateVariant = "loading" | "empty" | "error";

export interface AsyncStateProps {
  variant: AsyncStateVariant;
  message: string;
  action?: ReactNode;
}

export function AsyncState({ variant, message, action }: AsyncStateProps) {
  const accessibility =
    variant === "error"
      ? { role: "alert" as const }
      : { role: "status" as const, "aria-live": "polite" as const };

  return (
    <section className="ui-async-state" data-state={variant} {...accessibility}>
      <p className="ui-async-state__message">{message}</p>
      {action}
    </section>
  );
}
