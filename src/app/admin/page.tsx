"use client";

import { useCallback, useEffect, useState } from "react";
import { getSession, signOut, type AuthState } from "@/lib/adminAuth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { LeadsDashboard } from "@/components/admin/LeadsDashboard";

/**
 * /admin — hidden back office.
 *
 * Not linked anywhere in the public UI. Access is Appwrite email/password and
 * only members of the `admins` team can read the leads collection.
 */
export default function AdminPage() {
  const [state, setState] = useState<AuthState | null>(null);
  const [demo, setDemo] = useState(false);

  const refresh = useCallback(async () => {
    setState(await getSession());
  }, []);

  useEffect(() => {
    // /admin?demo=1 previews the table with sample rows (no Appwrite needed).
    const isDemo = new URLSearchParams(window.location.search).get("demo") === "1";
    setDemo(isDemo);
    if (!isDemo) void refresh();
  }, [refresh]);

  return (
    <div className="adm__shell">
      {!state && !demo && <p className="adm__empty">Loading…</p>}

      {demo && (
        <LeadsDashboard
          user={{ $id: "demo", name: "Preview", email: "preview@aggarwalstores.in" }}
          demo
        />
      )}

      {!demo && state?.status === "unconfigured" && (
        <div className="adm__login">
          <h1>Appwrite not configured</h1>
          <p>
            The admin panel needs an Appwrite project. Create <code>.env.local</code> from{" "}
            <code>.env.example</code> and set:
          </p>
          <pre className="adm__note adm__note--info" style={{ marginTop: 14, whiteSpace: "pre-wrap" }}>
{`NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=aggarwal`}
          </pre>
          <p style={{ marginTop: 14 }}>
            Then run <code>npm run build</code> again — these are build-time values.
          </p>
        </div>
      )}

      {!demo && state?.status === "signed_out" && <AdminLogin onSuccess={() => void refresh()} />}

      {!demo && state?.status === "not_admin" && (
        <div className="adm__login">
          <h1>Signed in, but not an admin</h1>
          <p>
            <strong>{state.user.email}</strong> is signed in, but the admin team check did not pass.
          </p>
          <p className="adm__note adm__note--err" style={{ marginTop: 14, textAlign: "left" }}>
            {state.reason}
          </p>
          <button
            className="btn btn--ink btn--block"
            style={{ marginTop: 18 }}
            onClick={() => void signOut().then(() => void refresh())}
          >
            Sign out
          </button>
        </div>
      )}

      {!demo && state?.status === "signed_in" && <LeadsDashboard user={state.user} />}
    </div>
  );
}
