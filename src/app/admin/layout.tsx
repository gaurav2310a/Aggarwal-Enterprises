import type { Metadata, Viewport } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: "Admin · Aggarwal's House",
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  themeColor: "#191512",
  width: "device-width",
  initialScale: 1,
};

/**
 * Hidden back-office route.
 *
 * There is deliberately NO link to /admin anywhere in the public site — the URL
 * is typed in manually. It is marked noindex and blocked in robots.txt.
 * The page itself is static; all data is fetched from Appwrite at runtime.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="adm">{children}</div>;
}
