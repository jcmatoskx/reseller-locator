'use client'

import { useState, useCallback, useMemo, useEffect, useRef, lazy, Suspense } from 'react'
import dynamic from 'next/dynamic'
import type { Reseller, ResellerWithDistance, FilterState, GeoLocation } from '@/lib/types'
import { filterResellers, attachDistances, sortResellers } from '@/lib/resellers'
import { geocode, getBrowserLocation } from '@/lib/geocoding'
import { SearchFilters } from './SearchFilters'
import { ResellerList } from './ResellerList'

// Lazy-load the Map so Leaflet JS doesn't load until the component mounts
const Map = dynamic(() => import('./Map').then((m) => ({ default: m.Map })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-evolt-surface">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-evolt-green border-t-transparent animate-spin" />
        <p className="text-sm text-evolt-muted font-medium">Loading map…</p>
      </div>
    </div>
  ),
})

interface ResellerLocatorProps {
  resellers: Reseller[]
}

const DEFAULT_FILTERS: FilterState = {
  query: '',
  country: 'PT',
  storeType: '',
  openNow: false,
  openOn: '',
}

export function ResellerLocator({ resellers }: ResellerLocatorProps) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [location, setLocation] = useState<GeoLocation | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isGeolocating, setIsGeolocating] = useState(false)
  const [mobileTab, setMobileTab] = useState<'map' | 'list'>('map')

  // Auto-height for iframe
  useEffect(() => {
    function postHeight() {
      const height = document.body.scrollHeight
      window.parent?.postMessage({ type: 'evolt-reseller-height', height }, '*')
    }
    const observer = new ResizeObserver(postHeight)
    observer.observe(document.body)
    postHeight()
    return () => observer.disconnect()
  }, [])

  const filteredResellers = useMemo<ResellerWithDistance[]>(() => {
    const filtered = filterResellers(resellers, filters)
    const withDist = attachDistances(filtered, location)
    return sortResellers(withDist, location !== null)
  }, [resellers, filters, location])

  const handleFiltersChange = useCallback((partial: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...partial }))
  }, [])

  const handleGeoSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setLocation(null)
      return
    }
    try {
      const result = await geocode(query)
      setLocation(result)
    } catch {
      // silently ignore
    }
  }, [])

  const handleNearMe = useCallback(async () => {
    setIsGeolocating(true)
    try {
      const loc = await getBrowserLocation()
      setLocation(loc)
    } catch {
      // user denied or unsupported
    } finally {
      setIsGeolocating(false)
    }
  }, [])

  const handleSelectReseller = useCallback((id: string) => {
    setSelectedId(id)
    // On mobile: switch to map tab to show the selected pin
    setMobileTab('map')
  }, [])

  return (
    <div className="flex flex-col h-full">
      {/* Search + Filters bar */}
      <SearchFilters
        filters={filters}
        locationLabel={location?.label ?? null}
        isGeolocating={isGeolocating}
        onFiltersChange={handleFiltersChange}
        onGeoSearch={handleGeoSearch}
        onNearMe={handleNearMe}
      />

      {/* Mobile tab switcher */}
      <div className="flex sm:hidden border-b border-evolt-border bg-white">
        {(['map', 'list'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={`
              flex-1 py-2.5 text-xs font-semibold capitalize
              border-b-2 transition-colors duration-150
              ${mobileTab === tab
                ? 'border-evolt-green text-evolt-green'
                : 'border-transparent text-evolt-muted hover:text-evolt-slate'}
            `}
          >
            {tab === 'map' ? (
              <span className="flex items-center justify-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                Map
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
                List ({filteredResellers.length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Desktop two-column / Mobile single tab */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* MAP — desktop: ~60%, mobile: conditional */}
        <div
          className={`
            relative
            sm:flex-[3] sm:block
            ${mobileTab === 'map' ? 'flex-1 block' : 'hidden'}
          `}
        >
          <Map
            resellers={filteredResellers}
            selectedId={selectedId}
            onSelectReseller={handleSelectReseller}
          />
        </div>

        {/* LIST PANEL — desktop: ~40%, mobile: conditional */}
        <div
          className={`
            sm:flex-[2] sm:block
            sm:border-l sm:border-evolt-border
            sm:max-w-[380px] sm:w-full
            ${mobileTab === 'list' ? 'flex-1 block' : 'hidden'}
          `}
        >
          <ResellerList
            resellers={filteredResellers}
            selectedId={selectedId}
            onSelectReseller={handleSelectReseller}
          />
        </div>
      </div>
    </div>
  )
}
