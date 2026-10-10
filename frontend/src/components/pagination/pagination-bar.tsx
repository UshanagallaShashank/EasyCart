// Pager under a list: "Showing x–y of n", rows-per-page picker, and Prev / page numbers / Next.
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { get_page_numbers } from './get-page-numbers';
import { SHOW_ALL } from './use-pagination';

const PAGE_SIZES = [10, 15, 25, 50, 100];

interface PaginationBarProps {
  page: number;
  totalPages: number;
  pageSize: number;
  start: number;
  end: number;
  total: number;
  noun: string;
  onPageChange(page: number): void;
  onPageSizeChange(size: number): void;
}

export function PaginationBar({ page, totalPages, pageSize, start, end, total, noun, onPageChange, onPageSizeChange }: PaginationBarProps) {
  return (
    <div className="flex flex-col gap-3 px-2 pt-1 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <span>Showing <strong className="font-semibold text-slate-900">{total ? start + 1 : 0}</strong>–<strong className="font-semibold text-slate-900">{end}</strong> of <strong className="font-semibold text-slate-900">{total}</strong> {noun}</span>
        <label className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500">Rows per page:</span>
          <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))} className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 shadow-2xs focus:border-sky-500 focus:outline-none">
            {PAGE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
            <option value={SHOW_ALL}>All ({total})</option>
          </select>
        </label>
      </div>
      {pageSize !== SHOW_ALL && totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center gap-1">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="h-8 px-2.5 text-xs"><ChevronLeft className="mr-0.5 size-3.5" /> Prev</Button>
          {get_page_numbers(page, totalPages).map((p, i) => p === '...'
            ? <span key={`gap-${i}`} className="px-1 text-xs text-slate-400">…</span>
            : <button key={p} type="button" onClick={() => onPageChange(p)} aria-current={p === page ? 'page' : undefined} className={cn('size-8 rounded-lg text-xs font-medium transition-colors', p === page ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')}>{p}</button>)}
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className="h-8 px-2.5 text-xs">Next <ChevronRight className="ml-0.5 size-3.5" /></Button>
        </nav>
      )}
    </div>
  );
}
