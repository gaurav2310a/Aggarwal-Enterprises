# AGGARWAL — Coming Soon

Premium, trust-first "Coming Soon" site for **Aggarwal House — Fashion • Home • Kitchen**, built with
Next.js (App Router) and exported as a **fully static site**. The two counters are
**Aggarwal Fashion** (*Modern Style for You*) and **Aggarwal Homeware** (*Better Home Happier Lives*).

- No server, no database, no Node runtime needed at the host
- Single page, fast, responsive, accessible
- Analytics-ready CTAs with Fashion / Homeware traffic separation
- Reusable "Scan to get early access" QR block for shop flex boards

---

## 1. Commands

```bash
npm install          # install dependencies
npm run dev          # local dev with hot reload -> http://localhost:3000
npm run typecheck    # tsc --noEmit

# ------------------------------------------------------------------
# STATIC BUILD  (this is the "static version" command)
# runs `next build`, which writes the whole site to ./out
# ------------------------------------------------------------------
npm run build        # == npm run export
npm run export       # explicit alias for the static build

npm run serve:static # preview the generated static site (serves ./out)
```

The static output lands in **`aggarwal-online/out/`**:

```
out/index.html        <- the entire one-page site
out/sitemap.xml
out/robots.txt
out/icon.svg
out/_next/static/**   <- css, js, self-hosted fonts (Fraunces + Inter)
```

### Deploying the static version

| Host | How |
| --- | --- |
| Netlify | drag the `out` folder onto <https://app.netlify.com/drop>, or connect the repo (build `npm run build`, publish `out`) |
| Vercel | connect the repo — `output: "export"` is detected automatically |
| GitHub Pages | `npm run build`, then publish `out` to the `gh-pages` branch |
| cPanel / shared hosting | upload the **contents** of `out/` into `public_html` |
| S3 / R2 / Firebase | `aws s3 sync out s3://your-bucket --delete` |

`output: "export"`, `images.unoptimized` and `trailingSlash: true` are already set
in `next.config.ts`, so every host resolves `/` correctly.

---

## 2. Where to change things

| What | File |
| --- | --- |
| Brand name, store names, categories | `src/lib/site.ts` |
| WhatsApp, phone, email, address, launch date | `.env.local` (see `.env.example`) |
| Where early-access leads are POSTed | `NEXT_PUBLIC_LEAD_ENDPOINT` in `.env.local` |
| Hero headline / copy | `src/components/Hero.tsx` |
| Store cards (Fashion / Homeware) | `src/components/StoreCards.tsx` |
| Countdown copy | `src/components/ComingSoon.tsx` |
| Early-access form fields | `src/components/EarlyAccess.tsx` |
| Preview products (name + note) | `ITEMS` in `src/components/ShopPreview.tsx` |
| Product placeholder drawings | `src/components/ProductArt.tsx` |
| QR placeholder | `src/components/QrCode.tsx` + `QrPanel.tsx` |
| Footer map (Google embed) | `src/components/StoreMap.tsx`, `MAP_EMBED_SRC` in `src/lib/site.ts` |
| Colours, type, spacing | `src/app/globals.css` (tokens at the top) |
| GA4 / GTM snippet | `src/app/layout.tsx` (`<head>`) |

### Brand system

- Neutral warm base: `--bg #fbf8f4`, `--ink #191512`, paper `--surface #ffffff`
- Single warm accent (saffron/terracotta): `--accent #b8531f`
- Display type **Fraunces** (warm, editorial); body/UI **Inter**
- Fashion reads contemporary (bold uppercase sans), Homeware reads calm
  (spaced serif caps) — same palette, same wordmark, one family

---

## 3. Early-access form

Out of the box the form validates and stores the lead in the browser
(`localStorage` key `aggarwal_early_access_leads`) so nothing is lost while testing.

To collect real leads, set an endpoint that accepts a JSON `POST`:

```env
NEXT_PUBLIC_LEAD_ENDPOINT=https://formspree.io/f/xxxxxxxx
```

Payload sent:

```json
{
  "name": "…",
  "mobile": "9876543210",
  "email": "…",
  "interest": "fashion | homeware | both",
  "whatsappOptIn": true,
  "source": "coming_soon_site",
  "page": "/",
  "submittedAt": "2026-01-01T00:00:00.000Z"
}
```

A WhatsApp alternative sits next to the form, so the shop can add people manually
even with no backend at all.

---

## 4. Analytics-ready CTAs

Every button and link that matters carries data attributes:

```html
<a data-cta="explore_fashion"
   data-cta-label="Explore Fashion"
   data-store="fashion"
   data-section="hero_store_cards">
```

- `data-cta` – stable event id (`get_early_access`, `join_the_launch`, `explore_homeware`, `whatsapp_optin`, `preview_tab`, `social_instagram`, …)
- `data-store` – **`fashion` / `homeware` / `general`**, so GA4 can build a segment per store
- `data-section` – where on the page the click happened

A single delegated listener (`src/components/Analytics.tsx`) pushes a `cta_click`
event to `window.dataLayer`, `gtag`, Plausible, Umami or Clarity — paste your GA4
snippet into `src/app/layout.tsx` and every button is tracked automatically.
Form signups fire `early_access_signup` with the selected store.

---

## 5. QR code for the shop flex boards

`QrPanel` appears in three places (hero, early access, footer) and always reads
**"SCAN TO GET EARLY ACCESS"**. The generated pattern is a *placeholder* — it does
not encode a URL yet. To make it real:

1. Generate a QR for your final URL and save it as `public/qr-early-access.png`
2. In `src/components/QrCode.tsx`, replace the `<svg>` with
   `<img src="/qr-early-access.png" width={size} height={size} alt="Scan to get early access" />`

For print: open the exported `out/index.html` in a browser, print the QR block at
100% scale, and place it on the counter stand / flex board.

---

## 6. Honesty guardrails

- No invented statistics, no "India's No.1", no fake reviews — the copy reads the
  way a real local shop would say it.
- Every product card is labelled **Coming Soon**; the preview section states
  outright that the images are placeholders.
- The countdown is a placeholder: update `NEXT_PUBLIC_LAUNCH_DATE` and adjust the
  "Launch date to be announced" line in `src/components/ComingSoon.tsx`.
- Replace the placeholder WhatsApp number, phone, email and address in `.env.local`
  before printing anything or going live.
- `src/components/Legal.tsx` holds plain-language Privacy Policy and Terms
  summaries — swap in your full legal text before launch.

---

## 7. Appwrite: database, admin login and Resend emails

Everything dynamic lives in **Appwrite**; the site itself stays a static export.

```
visitor form ──► create-lead function ──► Appwrite `leads` collection   (the data)
                             └───────► Resend ──► customer + owner email

/admin (hidden) ──► Appwrite Auth session ──► `admins` team check ──► leads table
                     └─► send-broadcast function ──► Resend ──► every lead
```

### One-time setup with the Appwrite CLI

```bash
npm i -g appwrite          # or: brew install appwrite/appwrite
appwrite login             # or export APPWRITE_TOKEN=...

# from the project root
powershell -ExecutionPolicy Bypass -File appwrite/setup.ps1 `
  -ProjectId aggarwalhouse `
  -OwnerEmail you@gmail.com -OwnerPassword "use-a-strong-one" `
  -ResendKey re_xxxxxxxxxxxx `
  -MailFrom "Aggarwal House <hello@yourdomain.com>"
```

The script (`appwrite/setup.ps1`) creates, in order:

| Step | What |
| --- | --- |
| project + platform client | `Aggarwal House`, Web SDK client |
| database + `leads` collection | read/update/delete **only for team `admins`** |
| 9 attributes | `name`, `mobile`, `email`, `interest`, `whatsappOptIn`, `source`, `page`, `status`, `notes` |
| index | on `$createdAt` for fast admin sorting |
| team `admins` | your account added as owner (this *is* the admin list) |
| function `create-lead` | guest-executable, writes the lead + sends Resend emails |
| function `send-broadcast` | **team-only**, emails every lead |
| function variables | `RESEND_API_KEY`, `MAIL_FROM`, `BRAND_NAME`, `OWNER_EMAIL`, ids |

Prefer the console? Equivalent manual steps are listed at the top of the script.

### Wiring the website

```env
# .env.local
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=aggarwalhouse
NEXT_PUBLIC_APPWRITE_DATABASE_ID=aggarwal
NEXT_PUBLIC_APPWRITE_LEADS_COLLECTION=leads
NEXT_PUBLIC_APPWRITE_TEAM_ADMINS=admins
NEXT_PUBLIC_APPWRITE_FN_CREATE_LEAD=create-lead
NEXT_PUBLIC_APPWRITE_FN_BROADCAST=send-broadcast
```

```bash
npm run build    # these are build-time values
```

**Resend keys never go in `.env.local`** — they live in Appwrite function variables, so
they cannot leak into the browser.

### The admin panel

- URL: **`https://your-domain.com/admin`** — typed in manually, **not linked anywhere** in
  the public UI, `noindex`, and `Disallow`ed in `robots.txt`.
- Sign in with Appwrite email + password. If the account is not a member of the
  `admins` team the session is deleted immediately and access is refused.
- Shows: total / today / Fashion / Homeware counts, search, store filter,
  per-lead IST date **and** time, tap-to-call and tap-to-email, a WhatsApp
  message link for opted-in leads, CSV export, and delete.
- **Send an email to the launch list** runs the Resend broadcast (`{name}` is
  replaced with each lead's first name).
- To see the layout before Appwrite is connected: **`/admin?demo=1`** (clearly
  labelled sample rows, no real data, delete/broadcast disabled).

### Fixing the "Appwrite is using localStorage" warning

That console warning is **expected on localhost**. It means Appwrite could not set a
first-party session cookie, so the SDK kept the session in `localStorage` instead.

| Where the site runs | What happens |
| --- | --- |
| `localhost` / unregistered domain | Appwrite replies `X-Fallback-Cookies` → session in localStorage + the warning. Fine for testing. |
| **Registered domain** (`https://yourdomain.com`) | Appwrite sets an HttpOnly `a_session_<projectId>` cookie → no warning, no token in JS, far safer. |

To get the cookie mode, add your domain to the platform:

1. Appwrite console → your project → **Settings → Platforms**
2. Open the **Web App** platform (the one the CLI called "Aggarwal Web")
3. **Domains** (hover the platform card) → add every hostname you serve from:
   - `aggarwalhouse.in`
   - `www.aggarwalhouse.in`
   - `localhost` is already there for development
4. Hard-refresh `/admin` and log in again — the warning disappears and the session
   cookie is set.

The code already adapts automatically (`isCookieFallbackMode()` in
`src/lib/appwrite.ts`): it only keeps a localStorage copy when a cookie could not
be set, so a properly configured production site is cookie-only.

> The API endpoint stays `https://cloud.appwrite.io/v1` (or your self-hosted
> endpoint) — registering your **site** domain is what enables the cookie.

### Adding another admin

1. Appwrite console → **Auth → Users → Invite** (or create email+password)
2. **Teams → admins → Add** that user
3. They can now sign in at `/admin`

### Security notes

- The `leads` collection has **no public permissions**; Appwrite itself rejects any
  request that is not from the `admins` team — the UI check is only a convenience.
- `create-lead` is intentionally public (the form must work for visitors). To limit
  abuse, add a captcha or Appwrite's rate limiting before launch.
- The site is static, so the admin session lives in the browser's localStorage —
  add 2FA for extra safety if leads become sensitive.


