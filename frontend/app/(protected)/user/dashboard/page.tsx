import Link from "next/link";

export interface UserDashboardPageProps {}

const recentRuns = [
  { date: "24 Okt 2024 · 14:15", file: "Wisuda_Gel1_TeknikElektro.xlsx", total: "340", matched: "318", review: "22", status: "Selesai" },
  { date: "23 Okt 2024 · 09:30", file: "Wisuda_Gel1_Informatika_SI.xlsx", total: "480", matched: "465", review: "15", status: "Selesai" },
  { date: "21 Okt 2024 · 16:45", file: "Wisuda_BatchA_Mesin.xlsx", total: "210", matched: "202", review: "8", status: "Selesai" },
  { date: "19 Okt 2024 · 11:20", file: "Draft_Wisuda_Bisnis.xlsx", total: "190", matched: "170", review: "20", status: "Draft" },
] as const;

export default function UserDashboardPage({}: UserDashboardPageProps) {
  return (
    <div className="dashboard-page" aria-labelledby="dashboard-title">
      <header className="dashboard-page__header">
        <div>
          <p className="graduation-upload__eyebrow">Portal operator ITCC · Sistem online & sinkron</p>
          <h1 id="dashboard-title">Selamat datang, Budi Santoso</h1>
          <p>Kelola dan sinkronkan data calon wisudawan dengan status kelulusan SITASI dan sertifikasi Microsoft Certiport secara presisi.</p>
        </div>
        <div className="dashboard-page__period"><span>Tahun akademik</span><strong>2024/2025 Ganjil</strong></div>
      </header>

      <section className="dashboard-hero" aria-labelledby="dashboard-hero-title">
        <div>
          <div className="dashboard-page__badges"><span className="ui-status-badge" data-tone="success">Data referensi siap</span><code>Mode validasi 14 sheet</code></div>
          <h2 id="dashboard-hero-title">Sinkronisasi Wisuda Periode Ganjil 2024/2025</h2>
          <p>Pencocokan otomatis Nomor Induk Mahasiswa terhadap basis data kelulusan SITASI dan ujian Certiport. Hasil validasi hanya mengisi dua kolom ITCC pada workbook asli.</p>
          <div className="dashboard-hero__batches"><span>SITASI aktif · <strong>SITASI-2024-Ganjil-v2</strong> (3.420 data)</span><span>Certiport aktif · <strong>Certiport-Okt-2024</strong> (1.895 data)</span></div>
        </div>
        <div className="dashboard-hero__actions"><Link className="ui-button ui-button--primary" href="/user/graduation-upload">Mulai sinkronisasi data</Link><Link className="dashboard-secondary-link" href="/user/graduation-upload">Unduh template wisuda (14 sheet)</Link></div>
      </section>

      <section className="dashboard-cards" aria-label="Status operasional">
        <article className="dashboard-card"><span className="dashboard-card__icon" aria-hidden="true">✓</span><h2>Status kesiapan referensi</h2><span className="ui-status-badge" data-tone="success">100% OK</span><p>Database SITASI dan Certiport aktif serta terverifikasi.</p><Link href="/user/reference-selection">Lihat aturan →</Link></article>
        <article className="dashboard-card"><span className="dashboard-card__icon" aria-hidden="true">↻</span><h2>Proses terakhir</h2><strong className="dashboard-card__metric">1.240</strong><p>Wisudawan diproses · <span className="dashboard-card__warning">42 perlu review</span></p><Link href="/user/synchronization/latest/progress">Buka review →</Link></article>
        <article className="dashboard-card"><span className="dashboard-card__icon" aria-hidden="true">▣</span><h2>File output terakhir</h2><span className="ui-status-badge" data-tone="success">Siap unduh</span><p>14 sheet · integritas kolom non-ITCC tetap terjaga.</p><Link href="/user/synchronization/latest/output">Unduh file output →</Link></article>
      </section>

      <section className="dashboard-panel" aria-labelledby="recent-runs-title">
        <div className="dashboard-panel__heading"><div><h2 id="recent-runs-title">Riwayat sinkronisasi terbaru</h2><p>Log pemrosesan berkas wisuda per prodi dan fakultas.</p></div><Link className="dashboard-secondary-link" href="/user/graduation-upload">Sinkronisasi baru</Link></div>
        <div className="dashboard-table-wrap"><table className="dashboard-table"><caption className="ui-visually-hidden">Riwayat sinkronisasi terbaru</caption><thead><tr><th scope="col">Tanggal proses</th><th scope="col">Nama file wisuda</th><th scope="col">Jumlah data</th><th scope="col">Cocok otomatis</th><th scope="col">Perlu review</th><th scope="col">Status</th></tr></thead><tbody>{recentRuns.map((run) => <tr key={run.file}><td><code>{run.date}</code></td><td><strong>{run.file}</strong><small>Fakultas ITCC</small></td><td>{run.total}</td><td className="dashboard-table__success">{run.matched}</td><td><span className="dashboard-table__count">{run.review}</span></td><td><span className={run.status === "Selesai" ? "ui-status-badge" : "ui-status-badge dashboard-table__pending"} data-tone={run.status === "Selesai" ? "success" : "warning"}>{run.status}</span></td></tr>)}</tbody></table></div>
      </section>

      <aside className="dashboard-notice"><strong>Protokol keamanan data ITCC</strong><p>Sistem hanya memperbarui <code>Sertifikasi MOS (Diisi ITCC)</code> dan <code>Title Microsoft (ITCC)</code>. Seluruh 14 sheet, rumus, styling, dan data asli BAAK dipertahankan.</p></aside>
    </div>
  );
}
