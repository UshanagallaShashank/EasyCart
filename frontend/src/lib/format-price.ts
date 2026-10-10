// Formats a numeric amount as a storefront price label in rupees.
const PRICE_FORMAT = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function format_price(value: number): string {
  return `Rs. ${PRICE_FORMAT.format(value)}`;
}
