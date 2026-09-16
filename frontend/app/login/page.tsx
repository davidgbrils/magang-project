"use client";

import React from "react";
import { LoginForm } from "../../features/auth/LoginForm";
import type { LoginAdapter } from "../../features/auth/auth-types";

const missingLoginProvider: LoginAdapter = () =>
  Promise.reject(new Error("Penyedia login belum dikonfigurasi."));

export default function LoginPage() {
  return (
    <main className="login-page">
      <h1>Masuk ke ITCC Wisuda Sync</h1>
      <p>Gunakan akun yang telah diberi akses oleh administrator ITCC.</p>
      <LoginForm onLogin={missingLoginProvider} />
    </main>
  );
}
