'use client'

import { DAY_LABELS } from '@/lib/types'
import type { ResellerHours } from '@/lib/types'

export function HoursTable({ hours }: { hours: ResellerHours }) {
  // Runs in the browser — new Date() reflects the actual current day
  const todayKey = (() => {
    try {
      const day = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Europe/Lisbon',
        weekday: 'short',
      }).format(new Date()).toLowerCase().slice(0, 3)
      const valid = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
      return valid.includes(day) ? day : null
    } catch { return null }
  })()

  return (
    <div className="space-y-1.5">
      {(Object.entries(hours) as [keyof ResellerHours, string][]).map(([day, h]) => {
        const isToday = day === todayKey
        return (
          <div
            key={day}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-sm ${
              isToday ? 'bg-evolt-green/10 ring-1 ring-evolt-green/30' : ''
            }`}
          >
            <span className={`w-24 shrink-0 ${isToday ? 'font-semibold text-evolt-navy' : 'text-evolt-slate'}`}>
              {DAY_LABELS[day]}
              {isToday && (
                <span className="ml-1.5 text-[10px] font-bold text-evolt-green uppercase tracking-wide">
                  Today
                </span>
              )}
            </span>
            <span className={`font-mono text-xs ${
              h === 'Fechado'
                ? 'text-evolt-muted'
                : isToday
                  ? 'text-evolt-navy font-bold'
                  : 'text-evolt-navy font-semibold'
            }`}>
              {h}
            </span>
          </div>
        )
      })}
    </div>
  )
}
