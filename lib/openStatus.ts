import type { ResellerHours } from './types'

export interface OpenStatus {
  isOpen: boolean
  /** Short display label e.g. "Open · Closes at 18:00" */
  label: string
  /** Key of today in the hours object */
  todayKey: keyof ResellerHours
}

type DayKey = keyof ResellerHours

const DAY_ORDER: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

const SHORT_LABELS: Record<DayKey, string> = {
  mon: 'Mon', tue: 'Tue', wed: 'Wed',
  thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
}

/** Locale weekday index → DayKey (0=Sun in JS Date, but we use Intl below) */
function parseMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + (m ?? 0)
}

function getNextOpenInfo(hours: ResellerHours, fromKey: DayKey): string | null {
  const idx = DAY_ORDER.indexOf(fromKey)
  for (let i = 1; i <= 7; i++) {
    const key = DAY_ORDER[(idx + i) % 7]
    const h = hours[key]
    if (h !== 'Fechado') {
      const [open] = h.split('-')
      const label = i === 1 ? `Tomorrow at ${open}` : `${SHORT_LABELS[key]} at ${open}`
      return label
    }
  }
  return null
}

/**
 * Compute the open/closed status for a reseller.
 * Uses the Europe/Lisbon timezone so it's accurate for PT stores.
 * Pass `now` to override (useful for testing).
 */
export function getOpenStatus(hours: ResellerHours, now?: Date): OpenStatus {
  const date = now ?? new Date()

  // Get current day + time in Lisbon timezone via Intl
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Lisbon',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date)

  const weekday = parts.find(p => p.type === 'weekday')?.value?.toLowerCase() ?? ''
  const hourStr  = parts.find(p => p.type === 'hour')?.value ?? '0'
  const minStr   = parts.find(p => p.type === 'minute')?.value ?? '0'

  // Map "mon", "tue" … from Intl (en-US short = Mon/Tue …)
  const dayKey = DAY_ORDER.find(d => d === weekday.slice(0, 3)) as DayKey | undefined
  const todayKey: DayKey = dayKey ?? 'mon'

  const currentMins = parseInt(hourStr) * 60 + parseInt(minStr)
  const todayHours = hours[todayKey]

  if (todayHours === 'Fechado') {
    const next = getNextOpenInfo(hours, todayKey)
    return {
      isOpen: false,
      label: next ? `Closed · Opens ${next}` : 'Closed today',
      todayKey,
    }
  }

  const [openStr, closeStr] = todayHours.split('-')
  const openMins  = parseMinutes(openStr)
  const closeMins = parseMinutes(closeStr)

  if (currentMins >= openMins && currentMins < closeMins) {
    return { isOpen: true, label: `Open · Closes at ${closeStr}`, todayKey }
  }

  if (currentMins < openMins) {
    return { isOpen: false, label: `Closed · Opens at ${openStr}`, todayKey }
  }

  // Past closing time — find next open slot
  const next = getNextOpenInfo(hours, todayKey)
  return {
    isOpen: false,
    label: next ? `Closed · Opens ${next}` : 'Closed for today',
    todayKey,
  }
}
