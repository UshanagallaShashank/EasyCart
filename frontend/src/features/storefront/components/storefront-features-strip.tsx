// Trust strip highlighting store benefits; scrolls sideways on phones.
import { Truck, ShieldCheck, Store, Headphones } from 'lucide-react';

const PERKS = [
  { icon: Truck, title: 'Local delivery', desc: 'Straight to your door' },
  { icon: Store, title: 'Store pickup', desc: 'Collect when it suits you' },
  { icon: ShieldCheck, title: 'Secure checkout', desc: 'Your details stay safe' },
  { icon: Headphones, title: 'Friendly support', desc: 'Here when you need us' }
];

export function StorefrontFeaturesStrip() {
  return (
    <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-4">
      {PERKS.map((perk) => (
        <li key={perk.title} className="flex min-w-[220px] snap-start items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600"><perk.icon className="size-5" /></span>
          <div>
            <p className="text-sm font-semibold text-slate-900">{perk.title}</p>
            <p className="text-xs text-slate-500">{perk.desc}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
