// Plain-language key for the store filters: what Live, Not published, and Suspended mean and who controls each.
import { CheckCircle2, EyeOff, Ban } from 'lucide-react';

const STATES = [
  { icon: CheckCircle2, tone: 'text-emerald-600', label: 'Live', text: 'customers can see and order (owner published it, and it is not suspended)' },
  { icon: EyeOff, tone: 'text-amber-600', label: 'Not published', text: 'the owner has not switched their shop on yet (Store settings › Publish)' },
  { icon: Ban, tone: 'text-rose-600', label: 'Suspended', text: 'an admin took it offline; the owner also loses dashboard access' }
];

export function StoreStateLegend() {
  return (
    <ul className="flex flex-col gap-1.5 rounded-xl bg-white/70 px-4 py-3 text-xs text-slate-600 ring-1 ring-slate-200/80 lg:flex-row lg:flex-wrap lg:gap-x-6">
      {STATES.map((s) => (
        <li key={s.label} className="flex min-w-0 items-start gap-1.5"><s.icon className={`mt-px size-3.5 shrink-0 ${s.tone}`} /><span><b className="font-semibold text-slate-800">{s.label}</b>: {s.text}</span></li>
      ))}
    </ul>
  );
}
