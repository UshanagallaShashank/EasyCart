// Feature highlight strip showing store value propositions and trust badges.
import { Truck, ShieldCheck, Award, Headphones } from 'lucide-react';

export function StorefrontFeaturesStrip() {
  const perks = [
    { icon: Truck, title: 'Free Delivery', desc: 'On orders over $50' },
    { icon: ShieldCheck, title: 'Secure Checkout', desc: '100% protected payments' },
    { icon: Award, title: 'Quality Guarantee', desc: 'Authentic tested products' },
    { icon: Headphones, title: 'Customer Support', desc: 'Always ready to help' }
  ];

  return (
    <div className="mx-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {perks.map((p) => (
        <div key={p.title} className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
            <p.icon className="size-4.5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-900">{p.title}</p>
            <p className="text-[11px] text-slate-500">{p.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
