"use client";

import { useState } from "react";
import { APP, getAppwrite } from "@/lib/appwrite";

type Result = { ok: boolean; message: string };

/**
 * Sends one email to every lead that supplied an address, through the
 * `send-broadcast` Appwrite Function (which holds the Resend key).
 * The function is permission-locked to the `admins` team.
 */
export function BroadcastPanel() {
  const [subject, setSubject] = useState("Aggarwal House is now online 🎉");
  const [message, setMessage] = useState(
    "Hi {name},\n\nOur online store is live. Browse Aggarwal Fashion and Aggarwal Homeware and order from home.\n\nSee you at the store,\nAggarwal House"
  );
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function send() {
    if (!confirm(`Send this email to every lead with an email address?`)) return;
    setBusy(true);
    setResult(null);
    try {
      const { functions } = await getAppwrite();
      const execution = await functions.createExecution({
        functionId: APP.broadcastFunctionId,
        body: JSON.stringify({ subject, message }),
        async: false,
      });
      if (execution.status !== "completed") {
        throw new Error(execution.responseBody || `Function status: ${execution.status}`);
      }
      const body = execution.responseBody ? JSON.parse(execution.responseBody) : {};
      setResult({
        ok: true,
        message: `Sent to ${body.sent ?? 0} recipient(s); ${body.failed ?? 0} failed.`,
      });
    } catch (err) {
      setResult({
        ok: false,
        message: err instanceof Error ? err.message : "Broadcast failed.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="adm__broadcast">
      <h2>Send an email to the launch list</h2>
      <p>
        Uses the Resend integration inside the <code>send-broadcast</code> Appwrite Function.{" "}
        <code>{"{name}"}</code> is replaced with each lead&apos;s first name.
      </p>

      <div className="field" style={{ marginBottom: 14 }}>
        <label htmlFor="bc-subject" style={{ color: "var(--ink-3)" }}>
          Subject
        </label>
        <input
          id="bc-subject"
          className="input"
          style={{ borderColor: "var(--line-2)", background: "var(--bg)", color: "var(--ink)" }}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>

      <div className="field" style={{ marginBottom: 16 }}>
        <label htmlFor="bc-message" style={{ color: "var(--ink-3)" }}>
          Message
        </label>
        <textarea
          id="bc-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={8}
        />
      </div>

      <button className="btn btn--primary" onClick={() => void send()} disabled={busy}>
        {busy ? "Sending…" : "Send to all leads"}
      </button>

      {result && (
        <p
          className={`adm__note ${result.ok ? "adm__note--ok" : "adm__note--err"}`}
          style={{ marginTop: 14 }}
          role="status"
        >
          {result.message}
        </p>
      )}
    </section>
  );
}
