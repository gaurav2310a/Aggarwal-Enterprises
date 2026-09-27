import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static site: `next build` emits a plain HTML/CSS/JS bundle in ./out
  // that can be hosted on Netlify, Vercel, GitHub Pages, S3, Netlify Drop, etc.
  output: "export",

  // next/image is not used for remote sources on a static export.
  images: { unoptimized: true },

  // Directory-style URLs (index.html) so any static host works.
  trailingSlash: true,
};

export default nextConfig;
