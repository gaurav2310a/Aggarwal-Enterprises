/**
 * Aggarwal's House — send-broadcast
 * --------------------------------
 * Executed from /admin by an authenticated member of the `admins` team.
 * Emails every lead that supplied an address, through Resend.
 *
 * Env vars:
 *   APPWRITE_DATABASE_ID / APPWRITE_LEADS_COLLECTION / APPWRITE_ADMINS_TEAM
 *   RESEND_API_KEY / MAIL_FROM / BRAND_NAME
 */

import { Client, TablesDB, Teams, Users, Query, ID } from "node-appwrite";
import { Resend } from "resend";
import { randomBytes } from "node:crypto";
import { broadcastEmail } from "./templates.js";

const BRAND = process.env.BRAND_NAME || "Aggarwal's House";
const ENDPOINT = process.env.APPWRITE_FUNCTION_API_ENDPOINT || "https://sgp.cloud.appwrite.io/v1";

/**
 * Admin action: turn a lead into a real Appwrite Auth user.
 *
 * Creating a user needs a privileged key, so this branch only works once the
 * project injects APPWRITE_FUNCTION_API_KEY (dynamic API keys enabled) or you
 * add a key with users.write as a function variable.
 */
async function makeUser(req, rowId, res, log, error) {
  const key = process.env.APPWRITE_FUNCTION_API_KEY;
  if (!key) {
    return res.json(
      {
        ok: false,
        error:
          "No API key on this function. Appwrite console > Settings > API Keys > Create (scopes: users.read, users.write), then add it here as a function variable named APPWRITE_FUNCTION_API_KEY, then redeploy.",
      },
      500
    );
  }

  try {
    const client = new Client()
      .setEndpoint(ENDPOINT)
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(key);

    const tables = new TablesDB(client);
    const users = new Users(client);

    const lead = await tables.getRow({
      databaseId: process.env.APPWRITE_DATABASE_ID || "aggarwal",
      tableId: process.env.APPWRITE_LEADS_COLLECTION || "leads",
      rowId,
    });

    const email = String(lead.email || "").trim();
    if (!email) {
      return res.json({ ok: false, error: "That lead has no email address." }, 400);
    }

    // node-appwrite v29: users.list() takes a params object.
    const existing = await users.list({ queries: [Query.equal("email", email)] });
    if (existing.total > 0) {
      // Already an account (e.g. the lead is the shop owner) — link it and move on.
      const userId = existing.users[0].$id;
      const stamp = `Matched an existing Appwrite account (${userId}) on ${new Date().toISOString()}`;
      await tables.updateRow({
        databaseId: process.env.APPWRITE_DATABASE_ID || "aggarwal",
        tableId: process.env.APPWRITE_LEADS_COLLECTION || "leads",
        rowId,
        data: {
          status: "converted",
          notes: [lead.notes, stamp].filter(Boolean).join("\n").slice(0, 1000),
        },
      });
      return res.json({ ok: true, alreadyExists: true, userId, email });
    }

    const password = `Ah${randomBytes(4).toString("hex")}!${Math.floor(Math.random() * 90 + 10)}`;
    const user = await users.create({
      userId: ID.unique(),
      email,
      password,
      name: String(lead.name || email.split("@")[0]),
    });

    try {
      await users.updateLabels(user.$id, ["lead"]);
    } catch {
      /* labels are optional */
    }

    const stamp = `Converted to an account on ${new Date().toISOString()}`;
    const notes = [lead.notes, stamp].filter(Boolean).join("\n").slice(0, 1000);
    await tables.updateRow({
      databaseId: process.env.APPWRITE_DATABASE_ID || "aggarwal",
      tableId: process.env.APPWRITE_LEADS_COLLECTION || "leads",
      rowId,
      data: { status: "converted", notes },
    });

    log(`User ${user.$id} created from lead ${rowId} (${email})`);
    return res.json({ ok: true, userId: user.$id, email, password });
  } catch (err) {
    error(err?.message || String(err));
    return res.json(
      { ok: false, error: `could not create the account: ${err?.message || err}` },
      500
    );
  }
}

function readBody(req) {
  if (!req.bodyText) return {};
  try {
    return JSON.parse(req.bodyText);
  } catch {
    return {};
  }
}

/**
 * The address bulk sends are addressed to (Resend needs a real `to`).
 * Falls back through NOTIFY_EMAIL -> OWNER_EMAIL -> REPLY_TO -> MAIL_FROM,
 * parsing the address out of a "Name <addr>" string.
 */
function notifyAddress() {
  const pick = (v) => {
    const s = String(v || "").trim();
    if (!s) return "";
    const m = s.match(/<([^>]+)>/);
    return m ? m[1] : s;
  };
  return (
    pick(process.env.NOTIFY_EMAIL) ||
    pick(process.env.OWNER_EMAIL) ||
    pick(process.env.REPLY_TO) ||
    pick(process.env.MAIL_FROM)
  );
}

/**
 * Reads the leads with the CALLER's own credentials.
 *
 * API keys do not bypass TablesDB permissions, so the request must carry the
 * signed-in admin's session — that is what satisfies read("team:admins").
 * We forward every x-appwrite-* header we received, which is exactly what the
 * browser SDK sent, so the identity is preserved.
 */
async function listLeadsAsCaller(req) {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT || "https://sgp.cloud.appwrite.io/v1")
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID);

  // Prefer a server key when one is injected, otherwise the caller's session.
  if (process.env.APPWRITE_FUNCTION_API_KEY) {
    client.setKey(process.env.APPWRITE_FUNCTION_API_KEY);
  } else {
    const session =
      req.headers["x-appwrite-session"] ||
      req.headers["x-appwrite-jwt"] ||
      req.headers["x-appwrite-key"];
    if (session) client.setSession(session);
  }

  const { rows } = await new TablesDB(client).listRows({
    databaseId: process.env.APPWRITE_DATABASE_ID || "aggarwal",
    tableId: process.env.APPWRITE_LEADS_COLLECTION || "leads",
    queries: [Query.limit(1000), Query.orderDesc("$createdAt")],
  });
  return rows;
}

export default async ({ req, res, log, error }) => {
  try {
    // Appwrite injects this only for authenticated calls.
    const caller = req.headers["x-appwrite-user-id"];
    if (!caller) {
      return res.json({ ok: false, error: "admin sign-in required" }, 401);
    }

    // Admin action branch: lead -> Appwrite Auth user.
    const { action, rowId } = readBody(req);
    if (action === "make-user") {
      return makeUser(req, rowId, res, log, error);
    }

    const { subject, message, ctaUrl: ctaUrlRaw, rowIds, mode, html } = readBody(req);
    if (!subject || (!message && !html)) {
      return res.json({ ok: false, error: "subject and a message (or HTML) are required" }, 400);
    }

    // Custom HTML is sent exactly as written; {name} is still replaced.
    const firstNameOf = (lead) => String(lead.name || "there").split(" ")[0];
    const renderHtml = (lead) =>
      html
        ? String(html).replace(/\{name\}/g, firstNameOf(lead))
        : broadcastEmail({
            name: firstNameOf(lead),
            message: String(message),
            ctaLabel: "Visit our store",
            ctaUrl: String(ctaUrlRaw || process.env.SITE_URL || "").replace(/\/$/, ""),
          });
    const renderText = (lead) =>
      html
        ? String(html)
            .replace(/<[^>]+>/g, " ")
            .replace(/\{name\}/g, firstNameOf(lead))
            .replace(/\s+/g, " ")
            .trim()
        : String(message).replace(/\{name\}/g, firstNameOf(lead));

    const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
    if (!resend) return res.json({ ok: false, error: "RESEND_API_KEY not configured" }, 500);

    const allRows = await listLeadsAsCaller(req);
    // Empty/absent rowIds = everyone with an email.
    const wanted = Array.isArray(rowIds) && rowIds.length ? new Set(rowIds) : null;
    const targets = allRows.filter(
      (r) => r.email && (!wanted || wanted.has(r.$id))
    );

    if (targets.length === 0) {
      return res.json(
        { ok: false, error: "No selected lead has an email address." },
        400
      );
    }

    const ctaUrl = String(ctaUrlRaw || process.env.SITE_URL || "").replace(/\/$/, "");
    const from = process.env.MAIL_FROM || BRAND;
    const sendMode = mode === "bcc" ? "bcc" : "separate";
    let sent = 0;
    let failed = 0;

    if (sendMode === "bcc") {
      // One email, everyone hidden in BCC — nobody sees who else got it.
      // Resend still needs a visible recipient, so address it to the shop.
      const visibleTo = notifyAddress();
      if (!visibleTo) {
        return res.json(
          {
            ok: false,
            error:
              "No recipient for the bulk send. Add a NOTIFY_EMAIL (or OWNER_EMAIL) function variable, for example you@gmail.com.",
          },
          400
        );
      }
      const sample = { name: "there" };
      const { error: mailError } = await resend.emails.send({
        from,
        to: visibleTo,
        bcc: targets.map((t) => t.email),
        subject: String(subject),
        html: renderHtml(sample),
        text: renderText(sample),
      });
      if (mailError) {
        failed = targets.length;
        error(`Bulk (bcc) send failed: ${mailError.message}`);
      } else {
        sent = targets.length;
        log(`Bulk bcc send to ${sent} lead(s).`);
      }
    } else {
      for (const lead of targets) {
        const { error: mailError } = await resend.emails.send({
          from,
          to: [lead.email],
          subject: String(subject),
          html: renderHtml(lead),
          text: renderText(lead),
        });
        if (mailError) {
          failed++;
          error(`Failed for ${lead.email}: ${mailError.message}`);
        } else {
          sent++;
        }
      }
      log(`Separate send: ${sent} delivered, ${failed} failed.`);
    }

    return res.json({ ok: true, sent, failed, mode: sendMode, total: allRows.length });
  } catch (err) {
    error(err?.message || String(err));
    return res.json({ ok: false, error: `broadcast failed: ${err?.message || err}` }, 500);
  }
};
