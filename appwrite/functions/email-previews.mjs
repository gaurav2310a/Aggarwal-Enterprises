/**
 * Renders the two customer-facing email templates to static HTML previews.
 * Run:  node appwrite/functions/email-previews.mjs
 * Open: email-previews/confirmation.html  and  email-previews/broadcast.html
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { confirmationEmail, broadcastEmail } from "./create-lead/src/templates.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(here, "..", "..", "email-previews");
fs.mkdirSync(outDir, { recursive: true });

const confirmation = confirmationEmail({
  name: "Priya Sharma",
  interestLine: "Aggarwal Fashion — Modern Style for You",
  whatsappUrl: "https://wa.me/918287412429",
});

const broadcast = broadcastEmail({
  name: "Priya",
  message: `Hi {name},

Our online store is finally open. Browse clothing and readymades from Aggarwal Fashion, and cookware, utensils and home essentials from Aggarwal Homeware — and order from home.

Your launch offer is waiting.`,
  ctaLabel: "Shop the collection",
  ctaUrl: "https://store.stacknova.in",
});

fs.writeFileSync(path.join(outDir, "confirmation.html"), confirmation);
fs.writeFileSync(path.join(outDir, "broadcast.html"), broadcast);
console.log("Written:", outDir);
