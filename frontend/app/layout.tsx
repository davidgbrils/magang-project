import "../styles/globals.css";

export const metadata = {
  title: "ITCC Wisuda Sync",
  description: "Workspace operasional ITCC untuk sinkronisasi data wisuda.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
