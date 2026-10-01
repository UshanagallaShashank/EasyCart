// Sky-blue EasyCart brand panel beside the store-owner sign-in forms (large screens only).
import { CheckCircle2 } from 'lucide-react';

const MERCHANT_POINTS = ['Launch a store with its own link in minutes', 'Track orders, stock and customers in one place', 'Offer delivery or pickup, with cash on delivery'];

export function MerchantBrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-gradient-to-br from-sky-500 via-sky-600 to-sky-800 p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="absolute -top-24 -right-24 size-96 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-32 -left-20 size-96 rounded-full bg-[#F58220]/25 blur-3xl" />
      <img src="/easy-cart-icon.png" alt="EasyCart" className="relative h-14 w-auto self-start rounded-2xl bg-white p-2 shadow-lg shadow-sky-900/20" />
      <div className="relative max-w-md">
        <p className="mb-3 text-sm font-semibold tracking-wide text-sky-100 uppercase">For store owners</p>
        <h2 className="font-heading text-4xl leading-tight font-bold tracking-tight text-balance">Run your shop online, without writing code.</h2>
        <ul className="mt-8 flex flex-col gap-4">
          {MERCHANT_POINTS.map((p) => <li key={p} className="flex items-start gap-3 text-sky-50"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#FDBA74]" /> {p}</li>)}
        </ul>
      </div>
      <p className="relative text-sm text-sky-100/80">© {new Date().getFullYear()} EasyCart</p>
    </aside>
  );
}
