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

import { Client, Databases, Teams } from "node-appwrite";
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
    // Appwrite injects the caller's id — empty for anonymous requests.
    const caller = req.headers["x-appwrite-user-id"];

    if (!caller) {
      return res.json({ ok: false, error: "admin sign-in required" }, 401);
    }

    const client = new Client()
      .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT || "https://cloud.appwrite.io/v1")
      .setProjectId(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(process.env.APPWRITE_FUNCTION_API_KEY);

    const teams = new Teams(client);
    try {
      await teams.getMembership(process.env.APPWRITE_ADMINS_TEAM || "admins", caller);
    } catch {
      return res.json({ ok: false, error: "not an admin" }, 403);
    }

    const { subject, message } = readBody(req);
    if (!subject || !message) {
      return res.json({ ok: false, error: "subject and message are required" }, 400);
    }

    const databases = new Databases(client);
    const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
    if (!resend) return res.json({ ok: false, error: "RESEND_API_KEY not configured" }, 500);

    const leads = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID || "aggarwal",
      process.env.APPWRITE_LEADS_COLLECTION || "leads",
      [databases.$listLimit(1000), databases.$listOrderAttribute("$createdAt")]
    );

    const targets = leads.documents.filter((d) => d.email);
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
    return res.json({ ok: true, sent, failed, total: leads.documents.length });
  } catch (err) {
    error(err?.message || String(err));
    return res.json({ ok: false, error: "broadcast failed" }, 500);
  }
};
