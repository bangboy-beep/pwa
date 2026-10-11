import { Coffee, UtensilsCrossed, Hotel, Home, Wine, Scissors, Store, TreePalm } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

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

export function getBusinessTypeMeta(type?: string | null) {
  return BUSINESS_TYPE_META[type || 'other'] ?? BUSINESS_TYPE_META.other
}

export function BusinessTypeIcon({ type, className = 'w-5 h-5' }: { type?: string | null; className?: string }) {
  const Icon = getBusinessTypeMeta(type).icon
  return <Icon className={className} aria-hidden="true" />
}
