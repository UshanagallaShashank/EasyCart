// Segmented visual password strength meter
export function PasswordStrengthBar({ password }: { password: string }) {
  if (!password) return null;
  const score = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
  const colors = ['bg-rose-500', 'bg-amber-500', 'bg-sky-500', 'bg-emerald-500'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-4 gap-1.5 h-1">
        {[0, 1, 2, 3].map((idx) => (
          <div key={idx} className={`rounded-full transition-all ${idx < score ? colors[score - 1] : 'bg-slate-200'}`} />
        ))}
      </div>
      <p className="text-[10px] text-right text-slate-400 font-medium">Security: {labels[Math.max(0, score - 1)]}</p>
    </div>
  );
}
