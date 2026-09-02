/** Short human-readable reference shown to the shopper and used to match a Wise bank transfer to an order. */
export function generateReferenceCode(): string {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `FS-${random}`;
}
