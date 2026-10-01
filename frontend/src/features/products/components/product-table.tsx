import { toast } from 'sonner';
import { Package } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/empty-state';
import { getStockTone, STATUS_TONE_CLASSNAME } from '@/lib/status-colors';
import { useProducts } from '../hooks/use-products';
import { useDeleteProduct } from '../hooks/use-delete-product';
import { ProductFormDialog } from './product-form-dialog';
import { AdjustStockDialog } from './adjust-stock-dialog';
import { ApiError } from '@/shared/api/api-error';
import type { Product } from '../types/product-types';

function ProductImage({ product }: { product: Product }) {
  if (product.images?.[0]) {
    return <img src={product.images[0]} alt={product.name} className="size-12 shrink-0 rounded-lg border bg-muted/20 object-cover" />;
  }
  return (
    <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-300">
      <Package className="size-5" />
    </span>
  );
}

function LowStockBadge({ product }: { product: Product }) {
  if (product.stock_quantity > product.low_stock_threshold) return null;
  return <Badge className={STATUS_TONE_CLASSNAME[getStockTone(product.stock_quantity, product.low_stock_threshold)]}>Low stock</Badge>;
}

export function ProductTable() {
  const { data: products, isLoading } = useProducts();
  const remove = useDeleteProduct();

  function handleDelete(id: string) {
    remove.mutate(id, {
      onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Failed to delete product')
    });
  }

  function renderActions(product: Product) {
    return (
      <>
        <AdjustStockDialog product={product} trigger={<Button variant="outline" size="sm">Stock</Button>} />
        <ProductFormDialog product={product} trigger={<Button variant="outline" size="sm">Edit</Button>} />
        <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)}>
          Delete
        </Button>
      </>
    );
  }

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!products?.length) return <EmptyState message="No products yet." />;

  return (
    <>
      {/* Phones: one card per product */}
      <ul className="flex flex-col gap-3 md:hidden">
        {products.map((product) => (
          <li key={product.id} className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs">
            <div className="flex items-center gap-3">
              <ProductImage product={product} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-900">{product.name}</p>
                <p className="text-sm tabular-nums text-slate-600">Rs. {product.price.toFixed(2)}</p>
              </div>
              {!product.is_active && <Badge className="bg-secondary text-secondary-foreground">Hidden</Badge>}
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
              <span className="tabular-nums">{product.stock_quantity} in stock</span>
              <LowStockBadge product={product} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">{renderActions(product)}</div>
          </li>
        ))}
      </ul>

      {/* Tablets and larger: table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} className="hover:bg-secondary/30">
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell><ProductImage product={product} /></TableCell>
                <TableCell className="tabular-nums">Rs. {product.price.toFixed(2)}</TableCell>
                <TableCell className="tabular-nums">
                  {product.stock_quantity}
                  <span className="ml-2"><LowStockBadge product={product} /></span>
                </TableCell>
                <TableCell>{product.is_active ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap justify-end gap-2">{renderActions(product)}</div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
