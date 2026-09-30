import { toast } from 'sonner';
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

export function ProductTable() {
  const { data: products, isLoading } = useProducts();
  const remove = useDeleteProduct();

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!products?.length) return <EmptyState message="No products yet." />;

  return (
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
            <TableCell>
              {product.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="size-10 rounded-lg object-cover border bg-muted/20"
                />
              ) : (
                <span className="text-xs text-muted-foreground italic">No image</span>
              )}
            </TableCell>
            <TableCell className="tabular-nums">Rs. {product.price.toFixed(2)}</TableCell>
            <TableCell className="tabular-nums">
              {product.stock_quantity}
              {product.stock_quantity <= product.low_stock_threshold && (
                <Badge className={`ml-2 ${STATUS_TONE_CLASSNAME[getStockTone(product.stock_quantity, product.low_stock_threshold)]}`}>Low stock</Badge>
              )}
            </TableCell>
            <TableCell>{product.is_active ? 'Yes' : 'No'}</TableCell>
            <TableCell className="flex justify-end gap-2">
              <AdjustStockDialog product={product} trigger={<Button variant="outline" size="sm">Stock</Button>} />
              <ProductFormDialog product={product} trigger={<Button variant="outline" size="sm">Edit</Button>} />
              <Button
                variant="destructive"
                size="sm"
                onClick={() =>
                  remove.mutate(product.id, {
                    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Failed to delete product')
                  })
                }
              >
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
