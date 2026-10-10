// Large numeric box for a one-time code, sized for thumbs and easy to read outside.
import { cn } from '@/lib/utils';

export function CodeInput({ id, length, value, onChange, label }: { id: string; length: number; value: string; onChange(value: string): void; label: string }) {
  return (
    <input id={id} aria-label={label} value={value} inputMode="numeric" autoComplete="one-time-code" maxLength={length} placeholder={'•'.repeat(length)}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, length))}
      className={cn('h-14 w-full rounded-xl border-2 border-slate-200 bg-white text-center font-mono text-2xl font-bold tracking-[0.5em] text-slate-900 outline-none transition-colors placeholder:text-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/15')} />
  );
}
