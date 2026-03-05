'use client'

import { useMemo } from 'react'
import type { ResellerHours } from '@/lib/types'
import { getOpenStatus } from '@/lib/openStatus'

interface OpenStatusBadgeProps {
  hours: ResellerHours
  /** 'sm' = compact chip for list card, 'md' = larger badge for detail page */
  size?: 'sm' | 'md'
}

export function OpenStatusBadge({ hours, size = 'sm' }: OpenStatusBadgeProps) {
  const status = useMemo(() => getOpenStatus(hours), [hours])

  if (size === 'sm') {
    return (
      <span className={`
        inline-flex items-center gap-1 px-2 py-0.5 rounded-full
        text-[10px] font-bold leading-none
        ${status.isOpen
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-slate-100 text-slate-500'}
      `}>
        <span className={`
          w-1.5 h-1.5 rounded-full
          ${status.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}
        `} />
        {status.isOpen ? 'Open' : 'Closed'}
      </span>
    )
  }

  // md — detail page badge
  return (
    <div className={`
      inline-flex items-center gap-2 px-3 py-1.5 rounded-xl
      text-sm font-semibold
      ${status.isOpen
        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        : 'bg-slate-100 text-slate-600 border border-slate-200'}
    `}>
      <span className={`
        w-2 h-2 rounded-full shrink-0
        ${status.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}
      `} />
      <span>{status.label}</span>
    </div>
  )
}
