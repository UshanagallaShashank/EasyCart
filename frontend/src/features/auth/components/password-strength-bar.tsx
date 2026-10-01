// Segmented password strength meter shown while creating a password.
const COLORS = ['bg-rose-500', 'bg-amber-500', 'bg-sky-500', 'bg-emerald-500'];
const LABELS = ['Weak', 'Fair', 'Good', 'Strong'];

export function PasswordStrengthBar({ password }: { password: string }) {
  if (!password) return null;
  const score = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;

  return (
    <div className="-mt-2 flex items-center gap-3" aria-live="polite">
      <div className="grid h-1.5 flex-1 grid-cols-4 gap-1.5">
        {[0, 1, 2, 3].map((i) => <div key={i} className={`rounded-full transition-colors ${i < score ? COLORS[score - 1] : 'bg-slate-200'}`} />)}
      </div>
      <p className="w-12 text-right text-xs font-medium text-slate-500">{LABELS[Math.max(0, score - 1)]}</p>
    </div>
  );
}
