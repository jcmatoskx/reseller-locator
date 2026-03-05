'use client'

import { useEffect, useRef } from 'react'
import type { ResellerWithDistance } from '@/lib/types'
import { ResellerCard } from './ResellerCard'

interface ResellerListProps {
  resellers: ResellerWithDistance[]
  selectedId: string | null
  onSelectReseller: (id: string) => void
}

export function ResellerList({ resellers, selectedId, onSelectReseller }: ResellerListProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef<HTMLDivElement>(null)

  // Scroll selected card into view
  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [selectedId])

  if (!resellers.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 px-6 py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-evolt-surface flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <p className="font-display font-semibold text-sm text-evolt-slate">No resellers found</p>
        <p className="text-xs text-evolt-muted">Try adjusting your search or filters</p>
      </div>
    )
  }

  return (
    <div
      ref={listRef}
      className="h-full overflow-y-auto reseller-scroll"
      role="list"
      aria-label="Resellers list"
    >
      {/* Result count header */}
      <div className="sticky top-0 z-10 px-4 py-2.5 bg-white/90 backdrop-blur-sm border-b border-evolt-border">
        <p className="text-xs font-semibold text-evolt-muted">
          {resellers.length} {resellers.length === 1 ? 'reseller' : 'resellers'} found
        </p>
      </div>

      {resellers.map((r) => {
        const isSelected = r.id === selectedId
        return (
          <div
            key={r.id}
            ref={isSelected ? selectedRef : undefined}
            role="listitem"
          >
            <ResellerCard
              reseller={r}
              selected={isSelected}
              onClick={() => onSelectReseller(r.id)}
            />
          </div>
        )
      })}

      {/* Bottom padding */}
      <div className="h-4" />
    </div>
  )
}
