import { QrCode } from "./QrCode";

/**
 * Prominent, reusable QR block for shop flex boards, counter stands and print.
 * Drop it anywhere; it always links back to the early-access form.
 */
export function QrPanel({
  variant = "light",
  size = 128,
  href = "#early-access",
  title = "Scan to get early access",
  note = "Point your phone camera at the code to open this page and join the launch list.",
}: {
  variant?: "light" | "dark";
  size?: number;
  href?: string;
  title?: string;
  note?: string;
}) {
  return (
    <div className={`qr-panel qr-panel--${variant}`}>
      <span className="qr-panel__code">
        <QrCode size={size} />
      </span>
      <span className="qr-panel__text">
        <strong>{title}</strong>
        <span>{note}</span>
      </span>
      <a
        className="sr-only"
        href={href}
        data-cta="qr_early_access"
        data-store="general"
        data-section="qr-panel"
      >
        {title}
      </a>
    </div>
  );
}
