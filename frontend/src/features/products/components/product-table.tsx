import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useProducts } from '../hooks/use-products';
import { useDeleteProduct } from '../hooks/use-delete-product';
import { ProductFormDialog } from './product-form-dialog';
import { AdjustStockDialog } from './adjust-stock-dialog';
import { ApiError } from '@/shared/api/api-error';

export function ProductTable() {
  const { data: products, isLoading } = useProducts();
  const remove = useDeleteProduct();

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!products?.length) return <p className="text-muted-foreground">No products yet.</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Active</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell>{product.name}</TableCell>
            <TableCell>{product.sku}</TableCell>
            <TableCell>${product.price.toFixed(2)}</TableCell>
            <TableCell>
              {product.stock_quantity}
              {product.stock_quantity <= product.low_stock_threshold && (
                <Badge variant="destructive" className="ml-2">Low stock</Badge>
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
