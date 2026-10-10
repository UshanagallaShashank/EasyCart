// Full-width announcement bar showing the store's current promotion text.
export function PromotionBar({ text }: { text: string | null }) {
  if (!text) return null;

  return (
    <div className="bg-slate-900 px-4 py-2.5 text-center text-xs font-medium tracking-wide text-white sm:text-sm">
      {text}
    </div>
  );
}
