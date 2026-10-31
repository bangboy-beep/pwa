import { Coffee, UtensilsCrossed, Hotel, Home, Wine, Scissors, Store, TreePalm, Dumbbell } from 'lucide-react'
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
    gym: 'Gym & Fitness',
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
    gym: 'Gym & Fitness',
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
  gym: Dumbbell,
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
  gym: { label: 'Gym & Fitness', icon: Dumbbell },
  other: { label: 'Lainnya', icon: Store },
}

export function getBusinessTypeMeta(type?: string | null, lang: Language = 'id', fallbackName?: string | null) {
  // Smart detection if type is generic 'other' but business name or slug contains keywords
  let resolvedType = type || 'other'
  if (resolvedType === 'other' && fallbackName) {
    const lower = fallbackName.toLowerCase()
    if (lower.includes('gym') || lower.includes('fitness')) {
      resolvedType = 'gym'
    } else if (lower.includes('hotel') || lower.includes('homestay') || lower.includes('resort')) {
      resolvedType = 'hotel'
    } else if (lower.includes('villa')) {
      resolvedType = 'villa'
    } else if (lower.includes('salon')) {
      resolvedType = 'salon'
    } else if (lower.includes('barber')) {
      resolvedType = 'barbershop'
    } else if (lower.includes('cafe') || lower.includes('kopi')) {
      resolvedType = 'cafe'
    }
  }

  const safeType = BUSINESS_TYPE_ICONS[resolvedType] ? resolvedType : 'other'
  const icon = BUSINESS_TYPE_ICONS[safeType] || Store
  const label = BUSINESS_TYPE_LABELS[lang]?.[safeType] || BUSINESS_TYPE_LABELS.id[safeType] || 'Other'
  return { label, icon }
}

export function BusinessTypeIcon({ type, className = 'w-5 h-5', fallbackName }: { type?: string | null; className?: string; fallbackName?: string | null }) {
  const Icon = getBusinessTypeMeta(type, 'id', fallbackName).icon
  return <Icon className={className} aria-hidden="true" />
}
