/**
 * Aggarwal House — send-broadcast
 * --------------------------------
 * Executed from /admin by an authenticated member of the `admins` team.
 * Emails every lead that supplied an address, through Resend.
 *
 * Env vars:
 *   APPWRITE_DATABASE_ID / APPWRITE_LEADS_COLLECTION / APPWRITE_ADMINS_TEAM
 *   RESEND_API_KEY / MAIL_FROM / BRAND_NAME
 */

import { Client, TablesDB, Teams } from "node-appwrite";
import { Resend } from "resend";

const BRAND = process.env.BRAND_NAME || "Aggarwal House";

function readBody(req) {
  if (!req.bodyText) return {};
  try {
    return JSON.parse(req.bodyText);
  } catch {
    return {};
  }
}

export default async ({ req, res, log, error }) => {
  try {
    // Called by an authenticated admin. The caller's own session is forwarded so
    // the read passes the table's read("team:admins") permission. If a key is
    // injected it is used instead (and can verify membership directly).
    const caller = req.headers["x-appwrite-user-id"];
    const session = req.headers["x-appwrite-session"] || req.headers["x-appwrite-key"];

    if (!caller) {
      return res.json({ ok: false, error: "admin sign-in required" }, 401);
    }

    const client = new Client()
      .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT || "https://cloud.appwrite.io/v1")
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID);

    if (process.env.APPWRITE_FUNCTION_API_KEY) {
      client.setKey(process.env.APPWRITE_FUNCTION_API_KEY);
    } else if (session) {
      client.setSession(session);
    }

    // Only meaningful when running with a key — otherwise the caller's session
    // already carries team rights.
    if (process.env.APPWRITE_FUNCTION_API_KEY) {
      const teams = new Teams(client);
      try {
        await teams.getMembership(
          process.env.APPWRITE_ADMINS_TEAM || "admins",
          caller
        );
      } catch {
        return res.json({ ok: false, error: "not an admin" }, 403);
      }
    }

    const { subject, message } = readBody(req);
    if (!subject || !message) {
      return res.json({ ok: false, error: "subject and message are required" }, 400);
    }

    const tables = new TablesDB(client);
    const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
    if (!resend) return res.json({ ok: false, error: "RESEND_API_KEY not configured" }, 500);

    const { rows } = await tables.listRows(
      process.env.APPWRITE_DATABASE_ID || "aggarwal",
      process.env.APPWRITE_LEADS_COLLECTION || "leads",
      1000
    );

    const targets = rows.filter((d) => d.email);
    let sent = 0;
    let failed = 0;

    for (const lead of targets) {
      const firstName = String(lead.name || "there").split(" ")[0];
      const { error: mailError } = await resend.emails.send({
        from: process.env.MAIL_FROM || BRAND,
        to: [lead.email],
        subject: String(subject),
        html: `<div style="font-family:Georgia,serif;max-width:560px;margin:auto;color:#191512">
  <p style="letter-spacing:.22em;text-transform:uppercase;font-size:12px;color:#b8531f">${BRAND}</p>
  <p>${String(message).replace(/\n/g, "<br/>").replace(/\{name\}/g, firstName)}</p>
</div>`,
      });
      if (mailError) {
        failed++;
        error(`Failed for ${lead.email}: ${mailError.message}`);
      } else {
        sent++;
      }
    }

    log(`Broadcast sent to ${sent} lead(s); ${failed} failed.`);
    return res.json({ ok: true, sent, failed, total: rows.length });
  } catch (err) {
    error(err?.message || String(err));
    return res.json({ ok: false, error: "broadcast failed" }, 500);
  }
};
