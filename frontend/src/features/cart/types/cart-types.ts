// A single line item held in a customer's cart for one store.
export interface CartLine {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  variant_label?: string;
  image?: string;
}
