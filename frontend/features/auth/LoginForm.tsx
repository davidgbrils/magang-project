"use client";

import React, { FormEvent, useState } from "react";
import { Button } from "../../components/ui/Button";
import { TextField } from "../../components/ui/TextField";
import type { LoginAdapter } from "./auth-types";

export interface LoginFormProps {
  onLogin: LoginAdapter;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const data = new FormData(event.currentTarget);

    try {
      await onLogin({
        email: String(data.get("email") ?? ""),
        password: String(data.get("password") ?? ""),
      });
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Login gagal. Periksa kembali akun Anda.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit} aria-busy={isSubmitting || undefined}>
      <TextField
        id="email"
        name="email"
        type="email"
        label="Email ITCC"
        autoComplete="email"
        disabled={isSubmitting}
        required
      />
      <TextField
        id="password"
        name="password"
        type="password"
        label="Kata sandi"
        autoComplete="current-password"
        disabled={isSubmitting}
        required
      />
      {error ? (
        <p className="login-form__error" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" loading={isSubmitting}>
        Masuk
      </Button>
    </form>
  );
}
