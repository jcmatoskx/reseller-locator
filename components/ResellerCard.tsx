'use client'

import { useState } from 'react'
import type { ResellerWithDistance } from '@/lib/types'
import { STORE_TYPE_LABELS, STORE_TYPE_COLORS } from '@/lib/types'
import { formatDistance } from '@/lib/haversine'
import { LogoAvatar } from './LogoAvatar'
import { OpenStatusBadge } from './OpenStatusBadge'

interface ResellerCardProps {
  reseller: ResellerWithDistance
  selected: boolean
  onClick: () => void
}

function ResellerPhoto({ src, name }: { src?: string; name: string }) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return <LogoAvatar name={name} size={44} />
  }

  return (
    <div className="shrink-0 w-11 h-11 rounded-xl overflow-hidden border border-evolt-border bg-evolt-surface">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={name}
        width={44}
        height={44}
        className="w-full h-full object-cover"
        onError={() => setFailed(true)}
        loading="lazy"
      />
    </div>
  )
}

export function ResellerCard({ reseller: r, selected, onClick }: ResellerCardProps) {
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lng}`

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left px-4 py-3.5 border-b border-evolt-border
        transition-all duration-150 focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-evolt-green focus-visible:ring-inset
        ${selected
          ? 'bg-evolt-navy/[0.03] border-l-2 border-l-evolt-green pl-[14px]'
          : 'bg-white hover:bg-evolt-surface border-l-2 border-l-transparent pl-[14px]'}
      `}
      aria-pressed={selected}
    >
      {/* Top row: photo + name + distance */}
      <div className="flex items-start gap-3 mb-2.5">
        <ResellerPhoto src={r.image} name={r.name} />

        <div className="flex-1 min-w-0">
          <span className="font-display font-bold text-sm text-evolt-navy leading-snug block truncate">
            {r.name}
          </span>

          {/* City + open/closed */}
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-evolt-slate">{r.city}, {r.countryCode}</span>
            <OpenStatusBadge hours={r.hours} size="sm" />
          </div>
        </div>

        {/* Distance badge */}
        {r.distance !== undefined && (
          <span className="shrink-0 font-mono text-[11px] font-semibold text-evolt-green bg-evolt-green/10 px-2 py-1 rounded-lg leading-none">
            {formatDistance(r.distance)}
          </span>
        )}
      </div>

      {/* Address + store type */}
      <div className="flex items-center gap-2 mb-2.5 pl-[56px]">
        <p className="text-xs text-evolt-muted truncate flex-1">{r.address}</p>
        <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full leading-none ${STORE_TYPE_COLORS[r.storeType]}`}>
          {STORE_TYPE_LABELS[r.storeType]}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 pl-[56px]">
        {r.website && (
          <a
            href={r.website}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="
              inline-flex items-center gap-1.5 px-3 py-1.5
              text-[11px] font-semibold text-evolt-slate
              bg-evolt-surface border border-evolt-border rounded-lg
              hover:bg-evolt-border hover:text-evolt-navy
              transition-colors duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-evolt-green
            "
            aria-label={`Visit ${r.name} website`}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            Website
          </a>
        )}
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="
            inline-flex items-center gap-1.5 px-3 py-1.5
            text-[11px] font-semibold text-white
            bg-evolt-navy rounded-lg
            hover:bg-evolt-navy-light
            transition-colors duration-150
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-evolt-green
          "
          aria-label={`Get directions to ${r.name}`}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
          </svg>
          Directions
        </a>
      </div>
    </button>
  )
}
