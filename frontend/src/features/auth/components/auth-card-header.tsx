// Header badge and titles for floating auth cards
interface AuthCardHeaderProps {
  title: string;
  subtitle: string;
}

export function AuthCardHeader({ title, subtitle }: AuthCardHeaderProps) {
  return (
    <div className="flex flex-col items-center text-center space-y-2 mb-1">
      <div className="w-28 h-22 sm:w-32 sm:h-24 rounded-2xl bg-white/95 border border-sky-100/90 shadow-md shadow-sky-500/10 flex items-center justify-center p-2 mb-0.5 overflow-hidden">
        <img
          src="/easy-cart-icon.png"
          alt="Easy Cart"
          className="w-full h-full object-contain transform transition-transform hover:scale-105"
        />
      </div>
      <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
      <p className="text-xs text-slate-500 max-w-xs">{subtitle}</p>
    </div>
  );
}
