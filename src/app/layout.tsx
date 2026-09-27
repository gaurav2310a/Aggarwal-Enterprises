import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@/components/Analytics";
import { BRAND, CONTACT, SOCIALS } from "@/lib/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://store.stacknova.in";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND.name} — ${BRAND.subline}, Coming Soon Online`,
    template: `%s | ${BRAND.name}`,
  },
  description:
    "Aggarwal's House is coming online. Shop clothing and readymades from Aggarwal Fashion, and cookware, utensils, appliances and home essentials from Aggarwal Homeware. Join the launch list for early access and launch offers.",
  keywords: [
    "Aggarwal's House",
    "Aggarwal Fashion",
    "Aggarwal Homeware",
    "Modern Style for You",
    "readymade garments",
    "kitchenware",
    "cookware",
    "home essentials",
    "coming soon",
    "local store online",
  ],
  applicationName: `${BRAND.name} Online`,
  authors: [{ name: BRAND.name }],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: `${BRAND.name} — ${BRAND.subline}`,
    title: `${BRAND.name} — Coming Online Soon`,
    description:
      "Fashion, home and kitchen from your local store, now coming online. Join the launch list.",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} — Coming Online Soon`,
    description:
      "Fashion, home and kitchen from your local store, now coming online. Join the launch list.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#fbf8f4",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ClothingStore",
  name: BRAND.name,
  alternateName: "Aggarwal Fashion & Aggarwal Homeware",
  slogan: BRAND.subline,
  description:
    "Aggarwal's House — fashion, home and kitchen from a local retail store. Aggarwal Fashion and Aggarwal Homeware are coming online. Join the launch list for early access.",
  url: SITE_URL,
  telephone: CONTACT.phoneDial,
  email: CONTACT.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: CONTACT.addressLines.join(", "),
    addressCountry: "IN",
  },
  sameAs: SOCIALS.map((s) => s.href),
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Aggarwal Fashion",
    itemListElement: [
      "Men",
      "Women",
      "Kids",
      "Casual Wear",
      "Formal Wear",
      "Readymade Garments",
    ].map((n) => ({ "@type": "Offer", itemOffered: { "@type": "Thing", name: n } })),
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${fraunces.variable}`}>
      <head>
        {/* Google Analytics 4 — drop your measurement ID here to enable it.
            No other code change is needed: every [data-cta] click is already
            pushed to dataLayer as event `cta_click`. */}
        {/* <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX" /> */}
        {/* <script>{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-XXXXXXX');`}</script> */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}

