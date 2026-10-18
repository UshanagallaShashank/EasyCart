// Feature highlight strip showing store value propositions and trust badges.
import { motion } from 'motion/react';
import { Truck, ShieldCheck, Award, Headphones } from 'lucide-react';
import { StaggerList, StaggerItem } from '@/components/motion/reveal';

const PERKS = [
  { icon: Truck, title: 'Free Delivery', desc: 'On orders over $50', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  { icon: ShieldCheck, title: 'Secure Checkout', desc: '100% protected payments', color: 'bg-sky-50 text-sky-600 border-sky-100' },
  { icon: Award, title: 'Quality Guarantee', desc: 'Authentic tested products', color: 'bg-purple-50 text-purple-600 border-purple-100' },
  { icon: Headphones, title: 'Customer Support', desc: 'Always ready to help', color: 'bg-orange-50 text-[#F58220] border-orange-100' }
];

export function StorefrontFeaturesStrip() {
  return (
    <StaggerList className="mx-4 grid sm:mx-6 grid-cols-2 gap-3.5 sm:grid-cols-4 sm:gap-4">
      {PERKS.map((perk) => (
        <StaggerItem key={perk.title}>
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all duration-300 hover:border-slate-200 hover:shadow-md"
          >
            <motion.div
              whileHover={{ rotate: [0, -12, 12, 0] }}
              transition={{ duration: 0.5 }}
              className={`flex size-11 shrink-0 items-center justify-center rounded-xl border ${perk.color}`}
            >
              <perk.icon className="size-5" />
            </motion.div>
            <div>
              <p className="text-xs font-bold text-slate-900">{perk.title}</p>
              <p className="text-[11px] font-medium text-slate-500">{perk.desc}</p>
            </div>
          </motion.div>
        </StaggerItem>
      ))}
    </StaggerList>
  );
}
