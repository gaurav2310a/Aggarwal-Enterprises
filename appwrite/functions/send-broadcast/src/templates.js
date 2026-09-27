/**
 * Shared email templates for Aggarwal's House.
 * Table-based HTML that renders correctly in Gmail, Outlook and Apple Mail.
 * Colours match the website: warm neutral base + saffron accent.
 */

export const INK = "#191512";
export const INK_SOFT = "#453e37";
export const MUTED = "#746c62";
export const ACCENT = "#b8531f";
export const PAPER = "#ffffff";
export const CANVAS = "#f4efe7";

export const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );

/** Wraps content in the branded shell used by every email. */
export function layout({ preheader = "", body, cta } = {}) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Aggarwal's House</title>
</head>
<body style="margin:0;padding:0;background:${CANVAS};">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CANVAS};padding:28px 12px;">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${PAPER};border-radius:14px;border:1px solid #e6dfd4;font-family:Arial,Helvetica,sans-serif;">
      <tr><td style="padding:28px 32px 22px;border-bottom:3px solid ${ACCENT};">
        <p style="margin:0;font-size:11px;letter-spacing:.24em;color:${ACCENT};text-transform:uppercase;">Fashion &middot; Home &middot; Kitchen</p>
        <p style="margin:8px 0 0;font-size:26px;letter-spacing:.16em;color:${INK};font-weight:700;">Aggarwal's House</p>
      </td></tr>
      <tr><td style="padding:30px 32px 8px;color:${INK_SOFT};font-size:16px;line-height:1.65;">${body}</td></tr>
      ${
        cta
          ? `<tr><td style="padding:14px 32px 30px;">
        <a href="${esc(cta.url)}" style="display:inline-block;background:${ACCENT};color:#ffffff;text-decoration:none;font-size:13px;font-weight:bold;letter-spacing:.1em;text-transform:uppercase;padding:14px 26px;border-radius:999px;">${esc(
              cta.label
            )}</a></td></tr>`
          : ""
      }
      <tr><td style="padding:22px 32px 26px;background:#faf7f3;border-top:1px solid #e6dfd4;color:${MUTED};font-size:12.5px;line-height:1.6;">
        <p style="margin:0 0 6px;color:${INK};font-weight:bold;">Aggarwal's House</p>
        <p style="margin:0;">Aggarwal Fashion &middot; Modern Style for You<br>Aggarwal Homeware &middot; Better Home Happier Lives</p>
        <p style="margin:12px 0 0;">Pradhan Chowk, Vikas Nagar, New Delhi</p>
      </td></tr>
      <tr><td style="padding:0 32px 26px;color:#9a9187;font-size:11.5px;line-height:1.6;">
        You are receiving this because you joined our launch list or asked us to contact you. We will only write about the Aggarwal's House online store.
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

/** 1) Confirmation sent the moment someone joins the launch list. */
export function confirmationEmail({ name, interestLine, whatsappUrl, voucherCode = "Will be provided later on launch." }) {
  return layout({
    preheader: `Thank you, ${name}. Your launch voucher is reserved.`,
    body: `
      <p style="margin:0 0 14px;color:${INK};font-size:20px;font-weight:bold;">Thank you, ${esc(
        String(name).split(" ")[0]
      )}.</p>
      <p style="margin:0 0 16px;">You are on the Aggarwal's House launch list. The moment our online store opens we will write to you first &mdash; and your launch offer will be waiting.</p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0;background:#fdf1e8;border:1px solid #e8cbb4;border-radius:10px;">
        <tr><td style="padding:18px;font-size:14px;color:${INK_SOFT};line-height:1.6;">
          <p style="margin:0 0 8px;color:${ACCENT};font-size:11px;letter-spacing:.18em;text-transform:uppercase;font-weight:bold;">Your launch voucher is reserved</p>
          <p style="margin:0 0 10px;">Use this code when the store opens, and on your first order online: </p>
          <p style="margin:0;font-size:24px;letter-spacing:.12em;font-weight:bold;color:${INK};">${esc(
            voucherCode
          )}</p>
        </td></tr>
      </table>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px;background:#faf7f3;border:1px solid #e6dfd4;border-radius:10px;">
        <tr><td style="padding:16px 18px;font-size:14px;color:${INK_SOFT};">
          <strong style="color:${INK};">You are interested in</strong><br>${esc(interestLine)}
        </td></tr>
      </table>
      <p style="margin:0 0 16px;">Meanwhile the shop is open as usual in Pradhan Chowk, Vikas Nagar, New Delhi. Come in, browse, and tell us what you would like to see online first.</p>
      <p style="margin:0;">We will keep you posted on new arrivals and festive offers &mdash; and you can message us on WhatsApp any time.</p>
    `,
    cta: whatsappUrl ? { label: "Message us on WhatsApp", url: whatsappUrl } : undefined,
  });
}

/** 2) Admin broadcast — sent to every lead that gave an email address. */
export function broadcastEmail({ name, message, ctaLabel, ctaUrl }) {
  const first = String(name || "there").split(" ")[0];
  const html = String(message || "")
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map(
      (p) =>
        `<p style="margin:0 0 16px;">${esc(p)
          .replace(/\n/g, "<br>")
          .replace(/\{name\}/g, esc(first))}</p>`
    )
    .join("\n");

  return layout({
    preheader: String(message || "").replace(/\{name\}/g, first).slice(0, 110),
    body: html,
    cta: ctaUrl ? { label: ctaLabel || "Visit our store", url: ctaUrl } : undefined,
  });
}

/** 3) Internal notification to the shop owner about a new lead. */
export function ownerLeadEmail({
  name,
  mobile,
  email,
  interest,
  whatsappOptIn,
  source,
  medium,
  campaign,
  device,
  adminUrl,
}) {
  const row = (label, value) =>
    value
      ? `<tr><td style="padding:7px 0;color:${MUTED};font-size:13px;width:130px;vertical-align:top;">${label}</td><td style="padding:7px 0;color:${INK};font-size:14px;font-weight:bold;">${esc(
          value
        )}</td></tr>`
      : "";

  return layout({
    preheader: `New launch-list lead: ${name}`,
    body: `
      <p style="margin:0 0 6px;color:${INK};font-size:20px;font-weight:bold;">New lead from the website</p>
      <p style="margin:0 0 18px;">Someone just joined the launch list from the coming-soon page.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e6dfd4;">
        ${row("Name", name)}
        ${row("Mobile", mobile)}
        ${row("Email", email || "—")}
        ${row("Store", interest)}
        ${row("WhatsApp opt-in", whatsappOptIn ? "Yes" : "No")}
        ${row("Source", source)}
        ${row("Medium", medium)}
        ${row("Campaign", campaign)}
        ${row("Device", device)}
      </table>
    `,
    cta: adminUrl ? { label: "Open the admin panel", url: adminUrl } : undefined,
  });
}

