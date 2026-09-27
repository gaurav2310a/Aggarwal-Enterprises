/**
 * Aggarwal House — create-lead
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
 *   MAIL_FROM                   "Aggarwal House <hello@yourdomain.com>"
 *   OWNER_EMAIL                 you@gmail.com
 *   BRAND_NAME                  Aggarwal House
 */

import { Client, Databases, ID } from "node-appwrite";
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

const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT || "https://cloud.appwrite.io/v1")
    .setProjectId(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_FUNCTION_API_KEY);

  const databases = new Databases(client);
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

    if (name.length < 2) {
      return res.json({ ok: false, error: "name is required" }, 400);
    }
    if (mobile.length < 10) {
      return res.json({ ok: false, error: "a valid mobile number is required" }, 400);
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return res.json({ ok: false, error: "invalid email address" }, 400);
    }

    // 1) store ------------------------------------------------------------
    const doc = await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID || "aggarwal",
      process.env.APPWRITE_LEADS_COLLECTION || "leads",
      ID.unique(),
      {
        name,
        mobile,
        email,
        interest,
        whatsappOptIn,
        source: String(body.source || "coming_soon_site").slice(0, 60),
        page: String(body.page || "/").slice(0, 120),
        status: "new",
      }
    );

    log(`Lead stored: ${doc.$id} (${interest})`);

    // 2) emails -----------------------------------------------------------
    let emailed = false;
    if (resend) {
      const storeLine =
        interest === "fashion"
          ? "Aggarwal Fashion — Modern Style for You"
          : interest === "homeware"
            ? "Aggarwal Homeware — Better Home Happier Lives"
            : "Aggarwal Fashion and Aggarwal Homeware";

      if (email) {
        const { error: mailError } = await resend.emails.send({
          from: process.env.MAIL_FROM || BRAND,
          to: [email],
          subject: `You are on the ${BRAND} launch list`,
          html: `<div style="font-family:Georgia,serif;max-width:560px;margin:auto;color:#191512">
  <p style="letter-spacing:.22em;text-transform:uppercase;font-size:12px;color:#b8531f">${esc(BRAND)}</p>
  <h1 style="font-size:26px">Thank you, ${esc(name)}.</h1>
  <p>You are on the launch list. We will write to you the moment our online store opens.</p>
  <p>You are interested in: <strong>${esc(storeLine)}</strong></p>
  <p>Until then, the shop is open as usual in Pradhan Chowk, Vikas Nagar, New Delhi.</p>
  <p style="font-size:13px;color:#746c62">You received this because you signed up on our website.
  We will only contact you about the launch.</p>
</div>`,
        });
        if (mailError) error(`Customer email failed: ${mailError.message}`);
        else emailed = true;
      }

      const { error: ownerError } = await resend.emails.send({
        from: process.env.MAIL_FROM || BRAND,
        to: [process.env.OWNER_EMAIL],
        subject: `New launch-list lead: ${name}`,
        html: `<div style="font-family:Georgia,serif;max-width:560px;margin:auto;color:#191512">
  <h2 style="font-size:20px">New lead from the website</h2>
  <p><strong>Name:</strong> ${esc(name)}<br/>
     <strong>Mobile:</strong> ${esc(mobile)}<br/>
     <strong>Email:</strong> ${esc(email || "—")}<br/>
     <strong>Store:</strong> ${esc(interest)}<br/>
     <strong>WhatsApp opt-in:</strong> ${whatsappOptIn ? "yes" : "no"}</p>
  <p>Open the panel: <code>/admin</code></p>
</div>`,
      });
      if (ownerError) error(`Owner email failed: ${ownerError.message}`);
    } else {
      log("RESEND_API_KEY not set — lead stored without emails.");
    }

    return res.json({ ok: true, documentId: doc.$id, emailed });
  } catch (err) {
    error(err?.message || String(err));
    return res.json({ ok: false, error: "could not save lead" }, 500);
  }
};
