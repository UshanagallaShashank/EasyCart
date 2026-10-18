// Brand cart icon with upward growth arrow and shopping bags
export function BrandCartIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 14H11L15 29H35L39 18H14" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="17" cy="35" r="3" fill="#0284C7" />
      <circle cx="33" cy="35" r="3" fill="#0284C7" />
      <path d="M17 25L23 31L38 13" stroke="#22C55E" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M30 13H38V21" stroke="#0284C7" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="21" y="16" width="6" height="8" rx="1.5" fill="#F58220" />
      <rect x="26" y="14" width="6" height="10" rx="1.5" fill="#22C55E" />
    </svg>
  );
}
