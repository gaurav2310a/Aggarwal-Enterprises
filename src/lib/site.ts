/**
 * Single place for brand copy + contact details.
 * Edit these values to update the whole site (WhatsApp number, address, links).
 */

export const BRAND = {
  name: "Aggarwal's House",
  wordmark: "Aggarwal's House",
  subline: "Fashion • Home • Kitchen",
  tagline: "Trusted locally. Shopping online soon.",
} as const;

export type StoreKey = "fashion" | "homeware";

export const STORES: Record<
  StoreKey,
  {
    key: StoreKey;
    name: string;
    short: string;
    blurb: string;
    tagline: string;
    categories: string[];
    audience: string;
  }
> = {
  fashion: {
    key: "fashion",
    name: "Aggarwal Fashion",
    short: "AGGARWAL FASHION",
    blurb: "Clothing & Readymades",
    tagline: "Modern Style for You",
    categories: [
      "Men",
      "Women",
      "Kids",
      "Casual Wear",
      "Formal Wear",
      "Readymade Garments",
    ],
    audience: "style",
  },
  homeware: {
    key: "homeware",
    name: "Aggarwal Homeware",
    short: "AGGARWAL HOMEWARE",
    blurb: "Kitchen & Home Essentials",
    tagline: "Better Home Happier Lives",
    categories: [
      "Kitchenware",
      "Utensils",
      "Cookware",
      "Kitchen Appliances",
      "Home Essentials",
      "Storage",
      "Gifts",
    ],
    audience: "home",
  },
};

/** Replace with the real number (country code + number, digits only). */
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "918287412429";

export const CONTACT = {
  phoneDisplay: process.env.NEXT_PUBLIC_PHONE_DISPLAY ?? "+91 82874 12429",
  phoneDial: process.env.NEXT_PUBLIC_PHONE_DIAL ?? "+918287412429",
  email: process.env.NEXT_PUBLIC_EMAIL ?? "hello@store.stacknova.in",
  addressLines: [
    process.env.NEXT_PUBLIC_ADDRESS_1 ?? "Aggarwal's House",
    process.env.NEXT_PUBLIC_ADDRESS_2 ?? "Pradhan Chowk, Vikas Nagar",
    process.env.NEXT_PUBLIC_ADDRESS_3 ?? "New Delhi, India",
  ],
  mapUrl:
    process.env.NEXT_PUBLIC_MAP_URL ??
    "https://maps.app.goo.gl/EVa6VaKLD4u3nZpM9",
} as const;

export const SOCIALS = [
  { key: "whatsapp", label: "WhatsApp", href: `https://wa.me/${WHATSAPP_NUMBER}` },
  { key: "instagram", label: "Instagram", href: "https://instagram.com/" },
  { key: "facebook", label: "Facebook", href: "https://facebook.com/" },
] as const;

/**
 * Google Maps "Share > Embed a map" iframe for the physical store.
 * Swap this string if the pin ever moves.
 */
export const MAP_EMBED_SRC =
  process.env.NEXT_PUBLIC_MAP_EMBED_SRC ??
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.485324231111!2d77.0445865!3d28.645183600000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d050005776553%3A0x1052db59a6ddce2f!2sAggarwal%20Bartan%20Bhandar!5e0!3m2!1sen!2sin!4v1790435317064!5m2!1sen!2sin";

/** Launch target used by the countdown. ISO date/time. */
export const LAUNCH_DATE_ISO =
  process.env.NEXT_PUBLIC_LAUNCH_DATE ?? "2027-01-01T10:00:00+05:30";

export const waLink = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
