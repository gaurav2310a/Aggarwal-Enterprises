"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "@/lib/adminAuth";

export function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await signIn(email, password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="adm__login">
      <h1>Admin sign in</h1>
      <p>Aggarwal House back office. Only accounts in the admins team can sign in.</p>

      <form className="form" onSubmit={onSubmit} style={{ marginTop: 22 }} noValidate>
        <div className="field">
          <label htmlFor="admin-email">Email</label>
          <input
            id="admin-email"
            className="input"
            type="email"
            autoComplete="username"
            placeholder="you@aggarwalstores.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            className="input"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <p className="adm__note adm__note--err" role="alert">
            {error}
          </p>
        )}

        <button className="btn btn--ink btn--block" type="submit" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p style={{ marginTop: 18, fontSize: 12.5 }}>
        No account? Add your email to the Appwrite <code>admins</code> team (see README §7).
      </p>
    </div>
  );
}
