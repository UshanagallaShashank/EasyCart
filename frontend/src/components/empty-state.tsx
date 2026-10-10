// Empty state placeholder with floating icon animation
import { PackageOpen } from 'lucide-react';

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200/80 hover:border-sky-300 py-12 px-4 transition-colors duration-200 text-center">
      <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100/80 flex items-center justify-center mb-3 animate-float-slow">
        <PackageOpen className="w-6 h-6 text-sky-500" />
      </div>
      <p className="text-slate-500 text-xs font-medium max-w-xs">{message}</p>
    </div>
  );
}
