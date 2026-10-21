// SmartQR Formatting Utilities
import type { Language } from '../../i18n/types'

/**
 * Format numeric price to Indonesian Rupiah (IDR) currency format or localized display.
 * Uses native Intl.NumberFormat with appropriate locale.
 * Example: 18000 -> "Rp 18.000" (ID) or "Rp 18,000" (EN)
 */
export function formatCurrency(amount: number, lang: Language = 'id'): string {
  const locale = lang === 'en' ? 'en-US' : 'id-ID'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}
