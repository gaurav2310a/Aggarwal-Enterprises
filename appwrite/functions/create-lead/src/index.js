/**
 * Aggarwal's House — create-lead
 * ------------------------------
 * Called by the public "Join the Launch" form (executes as guest).
 *
 *  1. Validates and stores the lead in the Appwrite `leads` collection
 *     (the document's $createdAt is the timestamp shown in /admin).
 *  2. Sends the automated Resend emails:
 *       - confirmation to the customer (only if an email was given)
 *       - instant notification to the shop owner
 *
 * Env vars (Appwrite function variables):
 *   APPWRITE_FUNCTION_API_KEY   auto-injected by Appwrite
 *   APPWRITE_DATABASE_ID        aggarwal
 *   APPWRITE_LEADS_COLLECTION   leads
 *   RESEND_API_KEY              re_xxxxxxxx
 *   MAIL_FROM                   "Aggarwal's House <hello@yourdomain.com>"
 *   OWNER_EMAIL                 you@gmail.com
 *   BRAND_NAME                  Aggarwal's House
 */

import { Client, TablesDB, ID } from "node-appwrite";
import { Resend } from "resend";
import { confirmationEmail, ownerLeadEmail } from "./templates.js";

const BRAND = process.env.BRAND_NAME || "Aggarwal's House";

function readBody(req) {
  if (!req.bodyText) return {};
  try {
    return JSON.parse(req.bodyText);
  } catch {
    return {};
  }
}

const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );

/**
 * Where owner notifications are sent. Falls back through NOTIFY_EMAIL,
 * OWNER_EMAIL, REPLY_TO and MAIL_FROM, parsing "Name <addr>" strings.
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
 * One-click unsubscribe headers.
 *
 * Gmail routes a message to the Promotions tab when it looks like a marketing
 * broadcast. A valid List-Unsubscribe (plus List-Unsubscribe-Post) marks the mail
 * as transactional, which is what keeps it in the Primary inbox.
 */
function unsubscribeHeaders(site) {
  const owner = notifyAddress() || "unsubscribe@localhost";
  const link = `${site}/#privacy`;
  return {
    "List-Unsubscribe": `<${link}>, <mailto:${owner}?subject=unsubscribe>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    "List-Id": `Aggarwal's House launch list <list.${
      process.env.MAIL_FROM_DOMAIN || "store.stacknova.in"
    }>`,
  };
}

export default async ({ req, res, log, error }) => {
  // Diagnostics: which injected variables actually arrived?
  log(
    `env key=${Boolean(process.env.APPWRITE_FUNCTION_API_KEY)} ` +
      `project=${process.env.APPWRITE_FUNCTION_PROJECT_ID || "missing"} ` +
      `endpoint=${process.env.APPWRITE_FUNCTION_API_ENDPOINT || "missing"} ` +
      `db=${process.env.APPWRITE_DATABASE_ID || "default"} ` +
      `table=${process.env.APPWRITE_LEADS_COLLECTION || "default"}`
  );

  // The function runs as a guest: the `leads` table grants create("any") and
  // keeps read/update/delete locked to the admins team. If a key is ever
  // injected (dynamic API keys enabled), it is used and takes precedence.
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT || "https://cloud.appwrite.io/v1")
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID);

  if (process.env.APPWRITE_FUNCTION_API_KEY) {
    client.setKey(process.env.APPWRITE_FUNCTION_API_KEY);
  }

  const tables = new TablesDB(client);
  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

  try {
    const body = readBody(req);
    const name = String(body.name || "").trim().slice(0, 120);
    const mobile = String(body.mobile || "").replace(/\D/g, "").slice(0, 20);
    const email = String(body.email || "").trim().slice(0, 200);
    const interest = ["fashion", "homeware", "both"].includes(body.interest)
      ? body.interest
      : "both";
    const whatsappOptIn = Boolean(body.whatsappOptIn);

    // Email is the primary contact now; mobile is optional.
    if (name.length < 2) {
      return res.json({ ok: false, error: "name is required" }, 400);
    }
    if (!email) {
      return res.json({ ok: false, error: "email is required" }, 400);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return res.json({ ok: false, error: "please enter a valid email address" }, 400);
    }
    if (mobile && mobile.length < 10) {
      return res.json({ ok: false, error: "that mobile number looks incomplete" }, 400);
    }

    // 1) store ------------------------------------------------------------
    // Only include optional fields when they have a value: an Appwrite "email"
    // attribute rejects an empty string and would fail the whole insert.
    // Campaign data comes from the QR code / links on the shop boards.
    const str = (v, max) => String(v ?? "").trim().slice(0, max);
    const utmSource = str(body.utmSource, 60);
    const utmMedium = str(body.utmMedium, 60);
    const utmCampaign = str(body.utmCampaign, 80);
    const utmTerm = str(body.utmTerm, 80);
    const utmContent = str(body.utmContent, 80);
    const referrer = str(body.referrer, 200);
    const device = str(body.device, 20);

    const data = {
      name,
      mobile,
      interest,
      whatsappOptIn,
      // `source` stays the quick-grouping field: the QR channel when known.
      source: utmSource || str(body.source, 60) || "coming_soon_site",
      page: str(body.page, 120) || "/",
      status: "new",
    };
    if (email) data.email = email;
    // `mobile` is a required column, so always send a value (empty when skipped).
    data.mobile = mobile;
    const leadNote = String(body.notes || "").trim().slice(0, 1000);
    if (leadNote) data.notes = leadNote;
    if (utmSource) data.utmSource = utmSource;
    if (utmMedium) data.utmMedium = utmMedium;
    if (utmCampaign) data.utmCampaign = utmCampaign;
    if (utmTerm) data.utmTerm = utmTerm;
    if (utmContent) data.utmContent = utmContent;
    if (referrer) data.referrer = referrer;
    if (device) data.device = device;

    const row = await tables.createRow(
      process.env.APPWRITE_DATABASE_ID || "aggarwal",
      process.env.APPWRITE_LEADS_COLLECTION || "leads",
      ID.unique(),
      data
    );

    log(
      `Lead stored: row ${row.$id} (${interest}) source=${data.source} medium=${utmMedium || "-"} campaign=${
        utmCampaign || "-"
      } device=${device || "-"}`
    );

    // 2) emails -----------------------------------------------------------
    let emailed = false;
    if (resend) {
      const storeLine =
        interest === "fashion"
          ? "Aggarwal Fashion — Modern Style for You"
          : interest === "homeware"
            ? "Aggarwal Homeware — Better Home Happier Lives"
            : "Aggarwal Fashion and Aggarwal Homeware";

      const site = (process.env.SITE_URL || "https://store.stacknova.in").replace(/\/$/, "");
      const wa = process.env.WHATSAPP_NUMBER
        ? `https://wa.me/${process.env.WHATSAPP_NUMBER}`
        : "";
      const shop = notifyAddress();

      if (email) {
        const { error: mailError } = await resend.emails.send({
          from: process.env.MAIL_FROM || BRAND,
          to: [email],
          replyTo: process.env.REPLY_TO || shop,
          subject: `You are on the ${BRAND} launch list`,
          html: confirmationEmail({
            name,
            interestLine: storeLine,
            whatsappUrl: wa,
          }),
          text: `Thank you ${String(name).split(" ")[0]}. You are on the ${BRAND} launch list. We will write to you the moment our online store opens. You are interested in: ${storeLine}.`,
          // Transactional signals — these are what keep Gmail putting the
          // message in the Primary tab instead of Promotions.
          headers: {
            ...unsubscribeHeaders(site),
            "X-Entity-Ref-ID": `lead/${row.$id}`,
            "Auto-Submitted": "auto-generated",
            "Precedence": "bulk",
          },
        });
        if (mailError) error(`Customer email failed: ${mailError.message}`);
        else emailed = true;
      }

      if (!shop) {
        error(
          "No owner address configured — set NOTIFY_EMAIL or OWNER_EMAIL as a function variable."
        );
      } else {
        const { error: ownerError } = await resend.emails.send({
          from: process.env.MAIL_FROM || BRAND,
          to: shop,
          replyTo: process.env.REPLY_TO || shop,
          subject: `New launch-list lead: ${name}`,
          html: ownerLeadEmail({
            name,
            mobile,
            email,
            interest,
            whatsappOptIn,
            source: data.source,
            medium: utmMedium,
            campaign: utmCampaign,
            device,
            adminUrl: `${site}/admin`,
          }),
          text: `New lead: ${name} (${mobile}) — ${interest}. Source: ${data.source} ${utmCampaign || ""}`,
        });
        if (ownerError) error(`Owner email failed: ${ownerError.message}`);
      }
    } else {
      log("RESEND_API_KEY not set — lead stored without emails.");
    }

    return res.json({
      ok: true,
      service: "aggarwal-create-lead",
      documentId: row.$id,
      emailed,
      database: process.env.APPWRITE_DATABASE_ID || "",
      collection: process.env.APPWRITE_LEADS_COLLECTION || "leads",
    });
  } catch (err) {
    // Surface the real Appwrite error (e.g. 404 database_not_found,
    // 400 invalid document) so the website can show something actionable.
    const message = err?.message || String(err);
    error(`create-lead failed: ${message}`);
    return res.json(
      {
        ok: false,
        error: message,
        database: process.env.APPWRITE_DATABASE_ID || "",
        collection: process.env.APPWRITE_LEADS_COLLECTION || "leads",
        endpoint: process.env.APPWRITE_FUNCTION_API_ENDPOINT || "(not set)",
        resendConfigured: Boolean(process.env.RESEND_API_KEY),
      },
      500
    );
  }
};
