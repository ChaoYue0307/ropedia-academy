import { useId } from "react";

// Ropedia Academy mark: a violet→indigo squircle with a geometric monogram "R"
// whose leg terminates in a cyan node — a nod to the spatial / concept-network
// theme. One source of truth (mirrored in public/favicon.svg and the og image).
export function Logo({ size = 36, className = "" }: { size?: number; className?: string }) {
  const id = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Ropedia Academy"
    >
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8b80ff" />
          <stop offset="1" stopColor="#4c37b0" />
        </linearGradient>
        <linearGradient id={`h${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.2" />
          <stop offset="0.55" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill={`url(#g${id})`} />
      <rect width="64" height="64" rx="15" fill={`url(#h${id})`} />
      <path
        d="M22 49 V15 H33 a9.5 9.5 0 0 1 0 19 H22 M27.5 34 L41 49"
        fill="none"
        stroke="#ffffff"
        strokeWidth="6.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="41" cy="49" r="4.2" fill="#67e8f9" />
    </svg>
  );
}
