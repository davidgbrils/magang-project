import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AsyncState } from "../../components/ui/AsyncState";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { TextField } from "../../components/ui/TextField";

describe("Button", () => {
  it("keeps a loading label perceivable and prevents duplicate activation", () => {
    const markup = renderToStaticMarkup(<Button loading>Simpan perubahan</Button>);

    expect(markup).toContain("disabled");
    expect(markup).toContain('aria-busy="true"');
    expect(markup).toContain("Sedang memproses");
    expect(markup).toContain("Simpan perubahan");
  });

  it("preserves native disabled button semantics", () => {
    const markup = renderToStaticMarkup(<Button disabled>Hapus batch</Button>);

    expect(markup).toMatch(/^<button/);
    expect(markup).toContain('type="button"');
    expect(markup).toContain("disabled");
  });
});

describe("TextField", () => {
  it("wires its label, hint, and error to the native input", () => {
    const markup = renderToStaticMarkup(
      <TextField
        id="student-id"
        label="Student / Employee ID"
        hint="Gunakan ID dari Certiport."
        error="ID wajib diisi."
      />,
    );

    expect(markup).toContain('<label for="student-id">Student / Employee ID</label>');
    expect(markup).toContain('aria-describedby="student-id-hint student-id-error"');
    expect(markup).toContain('aria-invalid="true"');
    expect(markup).toContain('id="student-id-error"');
    expect(markup).toContain('role="alert">ID wajib diisi.</');
  });
});

describe("StatusBadge", () => {
  it("always exposes status as text instead of colour alone", () => {
    const markup = renderToStaticMarkup(<StatusBadge tone="success">Selesai</StatusBadge>);

    expect(markup).toContain("Selesai");
    expect(markup).toContain('data-tone="success"');
  });
});

describe("AsyncState", () => {
  it.each([
    ["loading", "Data wisudawan sedang dimuat."],
    ["empty", "Belum ada batch wisuda."],
    ["error", "Data wisudawan gagal dimuat."],
  ] as const)("renders a human-readable %s message", (variant, message) => {
    const markup = renderToStaticMarkup(<AsyncState variant={variant} message={message} />);

    expect(markup).toContain(message);
  });

  it("renders an optional recovery action", () => {
    const markup = renderToStaticMarkup(
      <AsyncState
        variant="error"
        message="Data wisudawan gagal dimuat."
        action={<button type="button">Coba lagi</button>}
      />,
    );

    expect(markup).toContain("Coba lagi");
  });
});
