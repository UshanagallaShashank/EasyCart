// Rider photo, or their initials on a sky circle when there is no photo.
import { cn } from '@/lib/utils';
import { resolveApiFileUrl } from '@/shared/api/api-client';

export function RiderAvatar({ name, photoUrl, className }: { name: string; photoUrl: string | null; className?: string }) {
  const src = resolveApiFileUrl(photoUrl);
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || '?';
  return src ? (
    <img src={src} alt={name} className={cn('size-12 shrink-0 rounded-full object-cover ring-2 ring-white shadow-xs', className)} />
  ) : (
    <span className={cn('flex size-12 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700', className)}>{initials}</span>
  );
}
