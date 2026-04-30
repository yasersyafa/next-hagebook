export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
    >
      <defs>
        <linearGradient id="hb-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff005a" />
          <stop offset="100%" stopColor="#ff4d83" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#hb-grad)" />
      <path
        d="M9 8 v16 M9 16 h7 a4 4 0 0 1 4 4 v4 M22 13 l1.5 -1.5"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="22" cy="13" r="1.5" fill="#ffffff" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={className}>
      <span className="text-primary">hage</span>
      <span>book</span>
    </span>
  );
}
