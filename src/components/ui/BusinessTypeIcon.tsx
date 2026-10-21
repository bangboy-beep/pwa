import { Coffee, UtensilsCrossed, Hotel, Home, Wine, Scissors, Store, TreePalm } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Language } from '../../i18n/types'

export const BUSINESS_TYPE_LABELS: Record<Language, Record<string, string>> = {
  id: {
    restaurant: 'Restoran',
    cafe: 'Kafe',
    hotel: 'Hotel',
    homestay: 'Homestay',
    villa: 'Villa',
    bar: 'Bar',
    salon: 'Salon',
    barbershop: 'Barbershop',
    other: 'Lainnya',
  },
  en: {
    restaurant: 'Restaurant',
    cafe: 'Cafe',
    hotel: 'Hotel',
    homestay: 'Homestay',
    villa: 'Villa',
    bar: 'Bar',
    salon: 'Salon',
    barbershop: 'Barbershop',
    other: 'Other',
  },
}

export const BUSINESS_TYPE_ICONS: Record<string, LucideIcon> = {
  restaurant: UtensilsCrossed,
  cafe: Coffee,
  hotel: Hotel,
  homestay: Home,
  villa: TreePalm,
  bar: Wine,
  salon: Scissors,
  barbershop: Scissors,
  other: Store,
}

export const BUSINESS_TYPE_META: Record<string, { label: string; icon: LucideIcon }> = {
  restaurant: { label: 'Restoran', icon: UtensilsCrossed },
  cafe: { label: 'Kafe', icon: Coffee },
  hotel: { label: 'Hotel', icon: Hotel },
  homestay: { label: 'Homestay', icon: Home },
  villa: { label: 'Villa', icon: TreePalm },
  bar: { label: 'Bar', icon: Wine },
  salon: { label: 'Salon', icon: Scissors },
  barbershop: { label: 'Barbershop', icon: Scissors },
  other: { label: 'Lainnya', icon: Store },
}

export function getBusinessTypeMeta(type?: string | null, lang: Language = 'id') {
  const safeType = type && BUSINESS_TYPE_ICONS[type] ? type : 'other'
  const icon = BUSINESS_TYPE_ICONS[safeType] || Store
  const label = BUSINESS_TYPE_LABELS[lang]?.[safeType] || BUSINESS_TYPE_LABELS.id[safeType] || 'Other'
  return { label, icon }
}

export function BusinessTypeIcon({ type, className = 'w-5 h-5' }: { type?: string | null; className?: string }) {
  const Icon = getBusinessTypeMeta(type).icon
  return <Icon className={className} aria-hidden="true" />
}
