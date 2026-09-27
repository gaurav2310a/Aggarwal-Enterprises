type IconProps = { size?: number; className?: string; strokeWidth?: number };

const base = (size: number, strokeWidth: number, className?: string) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className,
  "aria-hidden": true,
});

export const CheckIcon = ({ size = 18, className, strokeWidth = 1.8 }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <path d="m4 12.5 5 5L20 6.5" />
  </svg>
);

export const StoreIcon = ({ size = 18, className, strokeWidth = 1.7 }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <path d="M3 9.5 4.5 4h15L21 9.5" />
    <path d="M3 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 4 0 2.5 2.5 0 0 0 4 0 2.5 2.5 0 0 0 5 0" />
    <path d="M5 12v8h14v-8" />
    <path d="M9.5 20v-5h5v5" />
  </svg>
);

export const SparkIcon = ({ size = 18, className, strokeWidth = 1.7 }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <path d="M12 3.5 13.9 9l5.6 2-5.6 2-1.9 5.5L10.1 13 4.5 11l5.6-2z" />
  </svg>
);

export const BagIcon = ({ size = 18, className, strokeWidth = 1.7 }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <path d="M5 8h14l-1 12H6z" />
    <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
  </svg>
);

export const TagIcon = ({ size = 18, className, strokeWidth = 1.7 }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <path d="M12.4 3.5H20V11l-8.6 8.6a1.5 1.5 0 0 1-2.1 0l-5.4-5.4a1.5 1.5 0 0 1 0-2.1z" />
    <circle cx="16.3" cy="7.7" r="1.3" />
  </svg>
);

export const WhatsAppIcon = ({ size = 18, className }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden
  >
    <path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.9.53 3.68 1.46 5.2L2 22l5.1-1.6a9.8 9.8 0 0 0 4.94 1.32h.01c5.43 0 9.84-4.4 9.84-9.84C21.89 6.4 17.48 2 12.04 2Zm5.72 13.9c-.24.68-1.4 1.3-1.94 1.34-.5.05-.98.24-3.3-.69-2.78-1.1-4.55-3.94-4.69-4.12-.14-.19-1.12-1.49-1.12-2.84s.71-2.02.96-2.29c.25-.28.55-.35.73-.35.18 0 .37 0 .53.01.17.01.4-.06.62.48.24.57.8 1.97.87 2.11.07.14.12.31.02.5-.1.19-.15.31-.29.47-.14.16-.3.36-.43.48-.14.14-.29.29-.12.57.17.28.74 1.22 1.59 1.98 1.09.97 2.01 1.27 2.29 1.41.28.14.44.12.61-.07.17-.19.71-.83.9-1.11.19-.28.37-.23.63-.14.25.09 1.65.78 1.93.92.28.14.47.21.54.33.07.12.07.69-.17 1.36Z" />
  </svg>
);

export const InstagramIcon = ({ size = 18, className }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.7}
    className={className}
    aria-hidden
  >
    <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.1" cy="6.9" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const FacebookIcon = ({ size = 18, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.6c-.29-.04-1.27-.13-2.4-.13-2.38 0-4 1.45-4 4.1V9.9H7.6V13h2.7v8z" />
  </svg>
);

export const PinIcon = ({ size = 18, className, strokeWidth = 1.7 }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <path d="M12 21s7-5.4 7-10.4A7 7 0 0 0 5 10.6C5 15.6 12 21 12 21Z" />
    <circle cx="12" cy="10.4" r="2.6" />
  </svg>
);

export const PhoneIcon = ({ size = 18, className, strokeWidth = 1.7 }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <path d="M6.4 3.5h2.3l1.4 3.5-1.7 1.3a11 11 0 0 0 5.3 5.3l1.3-1.7 3.5 1.4v2.3a2 2 0 0 1-2.2 2A15.8 15.8 0 0 1 4.4 5.7a2 2 0 0 1 2-2.2Z" />
  </svg>
);

export const MailIcon = ({ size = 18, className, strokeWidth = 1.7 }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <rect x="3" y="5.5" width="18" height="13" rx="2" />
    <path d="m3.8 7 8.2 6 8.2-6" />
  </svg>
);

export const ArrowIcon = ({ size = 18, className, strokeWidth = 1.8 }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <path d="M5 12h13" />
    <path d="m12.5 6 6 6-6 6" />
  </svg>
);

export const MenuIcon = ({ size = 22, className }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    className={className}
    aria-hidden
  >
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const CloseIcon = ({ size = 22, className }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    className={className}
    aria-hidden
  >
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const ShieldIcon = ({ size = 18, className, strokeWidth = 1.7 }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <path d="M12 3.2 19 6v5.4c0 4.3-2.9 7.6-7 9.4-4.1-1.8-7-5.1-7-9.4V6z" />
    <path d="m9 12 2.2 2.2L15.4 10" />
  </svg>
);

export const TruckIcon = ({ size = 18, className, strokeWidth = 1.7 }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <path d="M2.8 6.5h10.4v9H2.8z" />
    <path d="M13.2 10h4l3 3v2.5h-7z" />
    <circle cx="7" cy="18" r="1.7" />
    <circle cx="16.6" cy="18" r="1.7" />
  </svg>
);

export const TrashIcon = ({ size = 18, className, strokeWidth = 1.7 }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <path d="M4 6.5h16" />
    <path d="M9.5 6.5V4.8c0-.7.6-1.3 1.3-1.3h2.4c.7 0 1.3.6 1.3 1.3v1.7" />
    <path d="M6.2 6.5 7 19.2c0 .7.6 1.3 1.3 1.3h7.4c.7 0 1.3-.6 1.3-1.3l.8-12.7" />
    <path d="M10.5 10v6.8M13.5 10v6.8" />
  </svg>
);

export const UserPlusIcon = ({ size = 18, className, strokeWidth = 1.7 }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <circle cx="9.5" cy="8" r="3.6" />
    <path d="M3.5 20c.6-3.4 3-5.2 6-5.2 1.2 0 2.3.3 3.2.8" />
    <path d="M18 13.5v6M15 16.5h6" />
  </svg>
);

export const ChevronLeftIcon = ({ size = 18, className, strokeWidth = 1.8 }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <path d="M14.5 5 8 12l6.5 7" />
  </svg>
);

export const ChevronRightIcon = ({ size = 18, className, strokeWidth = 1.8 }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <path d="M9.5 5 16 12l-6.5 7" />
  </svg>
);
