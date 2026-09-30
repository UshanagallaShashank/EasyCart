export function AppLogo({ className }: { className?: string }) {
  return <span className={`font-heading text-2xl font-medium text-accent ${className ?? ''}`}>EasyCart</span>;
}
