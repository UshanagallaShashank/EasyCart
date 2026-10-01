// Feature highlight strip showing store value propositions and trust badges.
import { motion } from 'motion/react';
import { Truck, ShieldCheck, Award, Headphones } from 'lucide-react';
import { StaggerList, StaggerItem } from '@/components/motion/reveal';

const PERKS = [
  { icon: Truck, title: 'Free Delivery', desc: 'On orders over $50' },
  { icon: ShieldCheck, title: 'Secure Checkout', desc: '100% protected payments' },
  { icon: Award, title: 'Quality Guarantee', desc: 'Authentic tested products' },
  { icon: Headphones, title: 'Customer Support', desc: 'Always ready to help' }
];

export function StorefrontFeaturesStrip() {
  return (
    <StaggerList className="mx-4 grid sm:mx-6 grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {PERKS.map((perk) => (
        <StaggerItem key={perk.title}>
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs hover:border-sky-200 hover:shadow-md"
          >
            <motion.div
              whileHover={{ rotate: [0, -12, 12, 0] }}
              transition={{ duration: 0.5 }}
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600"
            >
              <perk.icon className="size-4.5" />
            </motion.div>
            <div>
              <p className="text-xs font-semibold text-slate-900">{perk.title}</p>
              <p className="text-[11px] text-slate-500">{perk.desc}</p>
            </div>
          </motion.div>
        </StaggerItem>
      ))}
    </StaggerList>
  );
}
