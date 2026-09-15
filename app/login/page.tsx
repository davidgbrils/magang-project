export default function LoginPage() {
  return (
    <main>
      <h1>Masuk ke ITCC Wisuda Sync</h1>
      <form>
        <label htmlFor="email">Email ITCC</label>
        <input id="email" name="email" type="email" autoComplete="email" required />
        <label htmlFor="password">Kata sandi</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
        <button type="submit">Masuk</button>
      </form>
    </main>
  );
}
