// Products list: cards on phones, a table on larger screens, each row with stock state and actions.
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatMoney } from '@/features/orders/lib/order-rules';
import { ProductThumb } from './product-thumb';
import { ProductStockLabel } from './product-stock-label';
import { ProductVisibilityBadge } from './product-visibility-badge';
import { ProductRowActions } from './product-row-actions';
import type { Product } from '../types/product-types';

function ProductIdentity({ product }: { product: Product }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <ProductThumb product={product} />
      <div className="min-w-0">
        <p className="truncate font-semibold text-slate-900">{product.name}</p>
        <p className="truncate text-xs text-slate-500">{product.sku ? `SKU ${product.sku}` : 'No SKU'}{product.variants.length > 0 && ` · ${product.variants.length} variants`}</p>
      </div>
    </div>
  );
}

export function ProductTable({ products }: { products: Product[] }) {
  return (
    <>
      <ul className="flex flex-col gap-3 md:hidden">
        {products.map((p) => (
          <li key={p.id} className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs">
            <div className="flex items-start justify-between gap-2"><ProductIdentity product={p} />{!p.is_active && <ProductVisibilityBadge isActive={false} />}</div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2">
              <div className="flex items-center gap-3"><span className="font-semibold tabular-nums">{formatMoney(p.price)}</span><ProductStockLabel product={p} /></div>
              <ProductRowActions product={p} />
            </div>
          </li>
        ))}
      </ul>
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
              <TableHead className="pl-5">Product</TableHead><TableHead>Price</TableHead><TableHead>Stock</TableHead><TableHead>Status</TableHead><TableHead className="pr-5 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="max-w-xs py-3 pl-5"><ProductIdentity product={p} /></TableCell>
                <TableCell className="font-medium tabular-nums">{formatMoney(p.price)}</TableCell>
                <TableCell><ProductStockLabel product={p} /></TableCell>
                <TableCell><ProductVisibilityBadge isActive={p.is_active} /></TableCell>
                <TableCell className="pr-5"><ProductRowActions product={p} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
