// SmartQR Formatting Utilities

/**
 * Format numeric price to Indonesian Rupiah (IDR) currency format.
 * Uses native Intl.NumberFormat with 'id-ID' locale.
 * Example: 18000 -> "Rp 18.000"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}
