'use client'

import { useState, useRef, useCallback } from 'react'
import type { StoreType, FilterState } from '@/lib/types'
import { STORE_TYPE_LABELS, ALL_STORE_TYPES, DAY_SHORT_LABELS, ALL_DAYS } from '@/lib/types'

interface SearchFiltersProps {
  filters: FilterState
  locationLabel: string | null
  isGeolocating: boolean
  onFiltersChange: (f: Partial<FilterState>) => void
  onGeoSearch: (query: string) => void
  onNearMe: () => void
}

export function SearchFilters({
  filters,
  locationLabel,
  isGeolocating,
  onFiltersChange,
  onGeoSearch,
  onNearMe,
}: SearchFiltersProps) {
  const [searchInput, setSearchInput] = useState('')
  const [locationInput, setLocationInput] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  const locationDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value)
    if (searchDebounce.current) clearTimeout(searchDebounce.current)
    searchDebounce.current = setTimeout(() => {
      onFiltersChange({ query: value })
    }, 300)
  }, [onFiltersChange])

  const handleLocationChange = useCallback((value: string) => {
    setLocationInput(value)
    if (locationDebounce.current) clearTimeout(locationDebounce.current)
    if (!value.trim()) return
    locationDebounce.current = setTimeout(() => {
      onGeoSearch(value)
    }, 800)
  }, [onGeoSearch])

  const handleLocationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (locationDebounce.current) clearTimeout(locationDebounce.current)
      onGeoSearch(locationInput)
    }
  }

  const hasActiveFilters = filters.storeType !== '' || filters.openNow || filters.openOn !== '' || locationLabel

  return (
    <div className="flex-shrink-0 bg-white border-b border-evolt-border">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-4 py-3">
        {/* Evolt wordmark */}
        <div className="flex items-center gap-2 shrink-0 mr-1">
          <div className="w-7 h-7 bg-evolt-green rounded-lg flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <span className="font-display font-bold text-sm text-evolt-navy hidden sm:block">
            Reseller Locator
          </span>
        </div>

        {/* Search input */}
        <div className="flex-1 relative min-w-0">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <input
            type="search"
            placeholder="Search by name, city, address…"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="
              w-full pl-9 pr-3 py-2 text-sm
              bg-evolt-surface border border-evolt-border rounded-xl
              text-evolt-navy placeholder-evolt-muted
              focus:outline-none focus:ring-2 focus:ring-evolt-green focus:border-transparent
              transition-all duration-150
            "
            aria-label="Search resellers"
          />
        </div>

        {/* Filter toggle button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`
            shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold
            border transition-all duration-150
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-evolt-green
            ${showFilters || hasActiveFilters
              ? 'bg-evolt-navy text-white border-evolt-navy'
              : 'bg-white text-evolt-slate border-evolt-border hover:bg-evolt-surface'}
          `}
          aria-expanded={showFilters}
          aria-label="Toggle filters"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
            <line x1="11" y1="18" x2="13" y2="18"/>
          </svg>
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 bg-evolt-green rounded-full inline-block" />
          )}
        </button>
      </div>

      {/* Expandable filters panel */}
      {showFilters && (
        <div className="px-4 pb-3 space-y-3 border-t border-evolt-border pt-3">
          {/* Location search row */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <input
                type="text"
                placeholder={locationLabel ?? 'Search near a location…'}
                value={locationInput}
                onChange={(e) => handleLocationChange(e.target.value)}
                onKeyDown={handleLocationKeyDown}
                className="
                  w-full pl-9 pr-3 py-2 text-sm
                  bg-evolt-surface border border-evolt-border rounded-xl
                  text-evolt-navy placeholder-evolt-muted
                  focus:outline-none focus:ring-2 focus:ring-evolt-green focus:border-transparent
                  transition-all duration-150
                "
                aria-label="Search near location"
              />
            </div>
            <button
              onClick={onNearMe}
              disabled={isGeolocating}
              className="
                shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold
                bg-evolt-green/10 text-evolt-green-dark border border-evolt-green/20
                hover:bg-evolt-green hover:text-white hover:border-evolt-green
                disabled:opacity-60 disabled:cursor-not-allowed
                transition-all duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-evolt-green
              "
              aria-label="Use my current location"
            >
              {isGeolocating ? (
                <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
                </svg>
              )}
              Near me
            </button>
          </div>

          {/* Store type filter */}
          <div>
            <label className="text-[11px] font-semibold text-evolt-muted uppercase tracking-wider block mb-2">
              Store Type
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_STORE_TYPES.map((type) => {
                const active = filters.storeType === type
                return (
                  <button
                    key={type}
                    onClick={() => onFiltersChange({ storeType: active ? '' : type })}
                    className={`
                      px-3 py-1.5 rounded-full text-[11px] font-semibold
                      border transition-all duration-150
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-evolt-green
                      ${active
                        ? 'bg-evolt-navy text-white border-evolt-navy'
                        : 'bg-white text-evolt-slate border-evolt-border hover:border-evolt-slate'}
                    `}
                    aria-pressed={active}
                  >
                    {STORE_TYPE_LABELS[type]}
                  </button>
                )
              })}
              {filters.storeType !== '' && (
                <button
                  onClick={() => onFiltersChange({ storeType: '' })}
                  className="px-3 py-1.5 rounded-full text-[11px] font-semibold text-evolt-muted hover:text-evolt-slate transition-colors focus-visible:outline-none"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Availability filter */}
          <div>
            <label className="text-[11px] font-semibold text-evolt-muted uppercase tracking-wider block mb-2">
              Availability
            </label>
            <div className="flex flex-wrap gap-1.5">
              {/* Open now toggle */}
              <button
                onClick={() => onFiltersChange({ openNow: !filters.openNow, openOn: filters.openNow ? filters.openOn : '' })}
                className={`
                  inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold
                  border transition-all duration-150
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-evolt-green
                  ${filters.openNow
                    ? 'bg-evolt-green text-white border-evolt-green'
                    : 'bg-white text-evolt-slate border-evolt-border hover:border-evolt-slate'}
                `}
                aria-pressed={filters.openNow}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${filters.openNow ? 'bg-white' : 'bg-evolt-green'}`} />
                Open now
              </button>
            </div>

            {/* Open on day */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {ALL_DAYS.map((day) => {
                const active = filters.openOn === day
                return (
                  <button
                    key={day}
                    onClick={() => onFiltersChange({ openOn: active ? '' : day, openNow: false })}
                    className={`
                      px-3 py-1.5 rounded-full text-[11px] font-semibold
                      border transition-all duration-150
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-evolt-green
                      ${active
                        ? 'bg-evolt-navy text-white border-evolt-navy'
                        : 'bg-white text-evolt-slate border-evolt-border hover:border-evolt-slate'}
                    `}
                    aria-pressed={active}
                  >
                    {DAY_SHORT_LABELS[day]}
                  </button>
                )
              })}
              {filters.openOn !== '' && (
                <button
                  onClick={() => onFiltersChange({ openOn: '' })}
                  className="px-3 py-1.5 rounded-full text-[11px] font-semibold text-evolt-muted hover:text-evolt-slate transition-colors focus-visible:outline-none"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Active location indicator */}
      {locationLabel && !showFilters && (
        <div className="px-4 pb-2 flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-evolt-green bg-evolt-green/10 px-2.5 py-1 rounded-full">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            Sorted by distance
          </div>
        </div>
      )}
    </div>
  )
}
