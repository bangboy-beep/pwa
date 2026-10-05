// SmartQR Business Utilities

export function formatBusinessType(type: string): string {
  const map: Record<string, string> = {
    restaurant: 'Restaurant',
    cafe: 'Cafe',
    hotel: 'Hotel',
    homestay: 'Homestay',
    villa: 'Villa',
    bar: 'Bar',
    salon: 'Salon',
    barbershop: 'Barbershop',
    other: 'Business',
  }
  return map[type?.toLowerCase()] || 'Business'
}

export function normalizeWhatsapp(whatsapp: string): string | null {
  if (!whatsapp) return null
  let cleaned = whatsapp.trim().replace(/[^\d+]/g, '')
  if (!cleaned) return null

  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1)
  }

  // Handle local Indonesian prefix 08 -> 628
  if (cleaned.startsWith('08')) {
    cleaned = '62' + cleaned.substring(1)
  }

  if (!/^\d+$/.test(cleaned)) return null

  return `https://wa.me/${cleaned}`
}

export function formatExternalUrl(url: string): string | null {
  if (!url) return null
  const trimmed = url.trim()
  if (!trimmed) return null
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export function getTelUrl(phone: string): string | null {
  if (!phone) return null
  const cleaned = phone.trim().replace(/[^\d+]/g, '')
  if (!cleaned) return null
  return `tel:${cleaned}`
}

export interface DayHours {
  open?: string
  close?: string
  closed?: boolean
  [key: string]: any
}

export const DAYS_CONFIG = [
  { keyEn: 'monday', keyId: 'senin', label: 'Senin', jsDay: 1 },
  { keyEn: 'tuesday', keyId: 'selasa', label: 'Selasa', jsDay: 2 },
  { keyEn: 'wednesday', keyId: 'rabu', label: 'Rabu', jsDay: 3 },
  { keyEn: 'thursday', keyId: 'kamis', label: 'Kamis', jsDay: 4 },
  { keyEn: 'friday', keyId: 'jumat', label: 'Jumat', jsDay: 5 },
  { keyEn: 'saturday', keyId: 'sabtu', label: 'Sabtu', jsDay: 6 },
  { keyEn: 'sunday', keyId: 'minggu', label: 'Minggu', jsDay: 0 },
]

export function parseDayHours(hoursData: any, keyEn: string, keyId: string): { open: string; close: string; closed: boolean } | null {
  if (!hoursData || typeof hoursData !== 'object') return null

  const dayVal = hoursData[keyEn] || hoursData[keyId] || hoursData[keyEn.toLowerCase()] || hoursData[keyId.toLowerCase()]
  if (!dayVal) return null

  // If marked closed
  if (dayVal === 'closed' || dayVal === 'tutup' || dayVal === 'libur' || dayVal.closed === true) {
    return { open: '', close: '', closed: true }
  }

  // If array format: ["08:00", "22:00"]
  if (Array.isArray(dayVal) && dayVal.length >= 2) {
    return { open: String(dayVal[0]), close: String(dayVal[1]), closed: false }
  }

  // If object format: { open: "08:00", close: "22:00" } or { start: "08:00", end: "22:00" }
  if (typeof dayVal === 'object') {
    const open = dayVal.open || dayVal.start || dayVal.opens || ''
    const close = dayVal.close || dayVal.end || dayVal.closes || ''
    const closed = dayVal.closed === true || dayVal.is_closed === true
    if (open && close) {
      return { open: String(open), close: String(close), closed }
    }
  }

  // If string format: "08:00 - 22:00" or "08:00-22:00"
  if (typeof dayVal === 'string') {
    const parts = dayVal.split(/[-–to]/i).map((s) => s.trim())
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return { open: parts[0], close: parts[1], closed: false }
    }
  }

  return null
}

function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0
  const [h, m] = timeStr.split(':').map(Number)
  return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m)
}

export interface BusinessStatusResult {
  isOpen: boolean
  statusText: string
  detailText?: string
}

export function getBusinessStatus(openingHours: any): BusinessStatusResult {
  if (!openingHours || typeof openingHours !== 'object') {
    return { isOpen: true, statusText: 'Jam operasional tidak tersedia' }
  }

  const now = new Date()
  const currentJsDay = now.getDay() // 0 = Sun, 1 = Mon ... 6 = Sat
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  // Find today's config
  const todayConfig = DAYS_CONFIG.find((d) => d.jsDay === currentJsDay)
  if (!todayConfig) {
    return { isOpen: true, statusText: 'Buka hari ini' }
  }

  const todayHours = parseDayHours(openingHours, todayConfig.keyEn, todayConfig.keyId)

  if (!todayHours) {
    return { isOpen: true, statusText: 'Buka hari ini' }
  }

  if (todayHours.closed) {
    return { isOpen: false, statusText: 'Tutup hari ini' }
  }

  const openMins = timeToMinutes(todayHours.open)
  const closeMins = timeToMinutes(todayHours.close)

  // Handle cross-midnight (e.g. open 18:00, close 02:00)
  if (closeMins < openMins) {
    // Closes on the next morning
    if (currentMinutes >= openMins || currentMinutes <= closeMins) {
      return {
        isOpen: true,
        statusText: 'Buka sekarang',
        detailText: `Tutup pukul ${todayHours.close}`,
      }
    } else {
      return {
        isOpen: false,
        statusText: 'Tutup sekarang',
        detailText: `Buka lagi pukul ${todayHours.open}`,
      }
    }
  }

  // Normal same-day hours
  if (currentMinutes >= openMins && currentMinutes <= closeMins) {
    return {
      isOpen: true,
      statusText: 'Buka sekarang',
      detailText: `Tutup pukul ${todayHours.close}`,
    }
  } else if (currentMinutes < openMins) {
    return {
      isOpen: false,
      statusText: 'Tutup sekarang',
      detailText: `Buka lagi pukul ${todayHours.open}`,
    }
  } else {
    return {
      isOpen: false,
      statusText: 'Tutup sekarang',
      detailText: 'Buka kembali besok',
    }
  }
}
