// Dark side panel on auth pages (large screens only) with a headline and three benefits.
import { CheckCircle2 } from 'lucide-react';

const COPY = {
  merchant: { headline: 'Run your shop online, without writing code.', points: ['Launch a store with its own link in minutes', 'Track orders, stock and customers in one place', 'Offer delivery or pickup, with cash on delivery'] },
  admin: { headline: 'Platform administration.', points: ['See every store on EasyCart', 'Suspend or reactivate stores', 'Sign-up needs the passcode from the server environment'] },
  customer: { headline: 'Shop local, check out faster.', points: ['Track every order in one place', 'Check out without retyping your details', 'Cancel pending orders yourself'] }
};

export function AuthBrandPanel({ variant }: { variant: keyof typeof COPY }) {
  const { headline, points } = COPY[variant];
  return (
    <aside className="relative hidden overflow-hidden bg-slate-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(56,189,248,0.35),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(245,130,32,0.25),_transparent_50%)]" />
      <img src="/easy-cart-icon.png" alt="EasyCart" className="relative h-12 w-auto self-start rounded-xl bg-white p-1.5" />
      <div className="relative max-w-md">
        <h2 className="font-heading text-4xl leading-tight font-bold tracking-tight text-balance">{headline}</h2>
        <ul className="mt-8 flex flex-col gap-4">
          {points.map((p) => <li key={p} className="flex items-start gap-3 text-slate-300"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-sky-400" /> {p}</li>)}
        </ul>
      </div>
      <p className="relative text-sm text-slate-500">© {new Date().getFullYear()} EasyCart</p>
    </aside>
  );
}
