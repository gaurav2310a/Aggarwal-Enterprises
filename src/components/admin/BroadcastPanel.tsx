"use client";

import { useState } from "react";
import { APP, callAdminFunction } from "@/lib/appwrite";

type Result = { ok: boolean; message: string };
export type SendMode = "separate" | "bcc";

/** Ready-made campaigns you can pick instead of writing the copy each time. */
const TEMPLATES = [
  {
    id: "launch",
    label: "🚀 Store is live",
    subject: "Aggarwal's House is now online 🎉",
    message: `Hi {name},

Our online store is finally open. Browse clothing and readymades from Aggarwal Fashion, and cookware, utensils and home essentials from Aggarwal Homeware — then order from home.

Your launch offer is waiting.`,
  },
  {
    id: "voucher",
    label: "🎁 Voucher code",
    subject: "Your Aggarwal's House launch voucher",
    message: `Hi {name},

Here is the voucher code you asked us to keep for launch day. Use it on your first order online, and on your second visit in the shop.

We will see you soon,
Aggarwal's House`,
  },
  {
    id: "new-arrivals",
    label: "🆕 New arrivals",
    subject: "New at Aggarwal's House this week",
    message: `Hi {name},

Fresh arrivals have landed in both stores — new readymades at Aggarwal Fashion, and new cookware and storage at Aggarwal Homeware.

Come and have a look, online or in the shop.`,
  },
  {
    id: "festive",
    label: "🎉 Festive offer",
    subject: "Festive offers have started at Aggarwal's House",
    message: `Hi {name},

The festive offers are live. Clothing, readymades, cookware and home essentials — all at shop prices, now online too.

Happy shopping,
Aggarwal's House`,
  },
  {
    id: "reengage",
    label: "💬 Still interested?",
    subject: "Are you still looking for something from us?",
    message: `Hi {name},

You joined our launch list a little while ago. Our online store is closer than ever — if you would like us to keep you informed, just reply to this email or message us on WhatsApp.

Thank you,
Aggarwal's House`,
  },
] as const;

/**
 * Sends an email to the launch list through the `send-broadcast` Appwrite
 * Function (which holds the Resend key).
 *
 * - "Separate"  → one personal email per recipient ({name} is replaced)
 * - "Bulk (BCC)" → a single email with everyone hidden in BCC (cheaper, private)
 * - Leave the recipient list empty to send to everyone with an email address.
 */
export function BroadcastPanel({
  selectedIds = [],
  totalWithEmail = 0,
}: {
  selectedIds?: string[];
  totalWithEmail?: number;
}) {
  const [subject, setSubject] = useState("Aggarwal's House is now online 🎉");
  const [message, setMessage] = useState(
    "Hi {name},\n\nOur online store is live. Browse clothing and readymades from Aggarwal Fashion, and cookware, utensils and home essentials from Aggarwal Homeware — and order from home.\n\nSee you at the shop,\nAggarwal's House"
  );
  const [mode, setMode] = useState<SendMode>("separate");
  const [templateId, setTemplateId] = useState<string>(TEMPLATES[0].id);
  const [editor, setEditor] = useState<"template" | "plain" | "html">("template");
  const [html, setHtml] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const usingCustomHtml = editor === "html" && html.trim().length > 0;

  function applyTemplate(id: string) {
    setTemplateId(id);
    const t = TEMPLATES.find((x) => x.id === id);
    if (t) {
      setSubject(t.subject);
      setMessage(t.message);
    }
  }

  const recipients = selectedIds.length
    ? `${selectedIds.length} selected lead(s)`
    : `all ${totalWithEmail} lead(s) with an email`;

  async function send() {
    const who = selectedIds.length
      ? `${selectedIds.length} selected lead(s)`
      : `all ${totalWithEmail} lead(s) with an email`;
    const how = mode === "bcc" ? "as ONE bulk BCC email" : "as SEPARATE personal emails";
    if (!confirm(`Send ${how} to ${who}?`)) return;

    setBusy(true);
    setResult(null);
    try {
      const body = await callAdminFunction(APP.broadcastFunctionId, {
        subject,
        message,
        mode,
        rowIds: selectedIds,
        ...(usingCustomHtml ? { html } : {}),
      });
      if (body.ok === false) {
        setResult({ ok: false, message: String(body.error ?? "Send failed.") });
      } else {
        setResult({
          ok: true,
          message: `${body.mode === "bcc" ? "Bulk BCC" : "Separate"} send: ${body.sent} delivered${
            body.failed ? `, ${body.failed} failed` : ""
          }.`,
        });
      }
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
        Sent through the <code>send-broadcast</code> function. <code>{"{name}"}</code> becomes
        each person&apos;s first name. Currently: <strong>{recipients}</strong>.
      </p>

      <div className="adm__modes">
        <label className={`adm__mode${mode === "separate" ? " is-on" : ""}`}>
          <input
            type="radio"
            name="sendmode"
            checked={mode === "separate"}
            onChange={() => setMode("separate")}
          />
          <span>
            <strong>Separate</strong>
            <em>One personal email per person</em>
          </span>
        </label>
        <label className={`adm__mode${mode === "bcc" ? " is-on" : ""}`}>
          <input
            type="radio"
            name="sendmode"
            checked={mode === "bcc"}
            onChange={() => setMode("bcc")}
          />
          <span>
            <strong>Bulk (BCC)</strong>
            <em>One email, recipients hidden</em>
          </span>
        </label>
      </div>

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

      <div className="adm__modes adm__modes--3">
        {(
          [
            ["template", "📄 Template", "Pick a ready campaign"],
            ["plain", "✍️ Write it", "Plain text, {name} works"],
            ["html", "🧩 Custom HTML", "Paste your own email HTML"],
          ] as const
        ).map(([id, label, hint]) => (
          <label key={id} className={`adm__mode${editor === id ? " is-on" : ""}`}>
            <input
              type="radio"
              name="editor"
              checked={editor === id}
              onChange={() => setEditor(id)}
            />
            <span>
              <strong>{label}</strong>
              <em>{hint}</em>
            </span>
          </label>
        ))}
      </div>

      {editor === "template" && (
        <div className="field" style={{ marginBottom: 14 }}>
          <label htmlFor="bc-template" style={{ color: "var(--ink-3)" }}>
            Campaign template
          </label>
          <select
            id="bc-template"
            className="input"
            style={{ borderColor: "var(--line-2)", background: "var(--bg)", color: "var(--ink)" }}
            value={templateId}
            onChange={(e) => applyTemplate(e.target.value)}
          >
            {TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {editor === "html" ? (
        <div className="field" style={{ marginBottom: 16 }}>
          <label htmlFor="bc-html" style={{ color: "var(--ink-3)" }}>
            Email HTML (sent exactly as written — <code>{"{{name}}"}</code> is replaced)
          </label>
          <textarea
            id="bc-html"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            rows={12}
            style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12.5 }}
            placeholder="<div style=&quot;font-family:Arial,sans-serif&quot;><h1>Hello {name}</h1>…</div>"
          />
          <p style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 6 }}>
            Tip: paste the HTML from any email designer. Keep it table-based and inline-styled so
            Gmail and Outlook render it correctly.
          </p>
        </div>
      ) : (
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
      )}

      <button className="btn btn--primary" onClick={() => void send()} disabled={busy}>
        {busy ? "Sending…" : `Send to ${selectedIds.length || "all"}`}
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
