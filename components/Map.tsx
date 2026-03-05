'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { ResellerWithDistance } from '@/lib/types'
import { formatDistance } from '@/lib/haversine'
import { getOpenStatus } from '@/lib/openStatus'

interface MapProps {
  resellers: ResellerWithDistance[]
  selectedId: string | null
  onSelectReseller: (id: string) => void
}

// Leaflet is loaded lazily — types are imported only
type LeafletMap = import('leaflet').Map
type LeafletMarker = import('leaflet').Marker

export function Map({ resellers, selectedId, onSelectReseller }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<globalThis.Map<string, LeafletMarker>>(new globalThis.Map<string, LeafletMarker>())
  const initRef = useRef(false)

  // Build custom marker icon
  const buildIcon = useCallback((L: typeof import('leaflet'), selected: boolean) => {
    return L.divIcon({
      className: '',
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -40],
      html: `
        <div style="
          width:36px;height:36px;
          background:${selected ? '#1A1A1A' : '#F9A138'};
          border:3px solid white;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          box-shadow:0 2px 10px rgba(${selected ? '26,26,26' : '249,161,56'},0.45);
          transition:all 0.2s ease;
        ">
          <div style="
            width:100%;height:100%;
            display:flex;align-items:center;justify-content:center;
            transform:rotate(45deg);
          ">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
        </div>
      `,
    })
  }, [])

  // Build popup HTML
  const buildPopup = useCallback((r: ResellerWithDistance) => {
    const distance = r.distance !== undefined ? formatDistance(r.distance) : null
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lng}`
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
    const detailUrl = `${basePath}/r/${r.slug}`
    const status = getOpenStatus(r.hours)
    const statusColor = status.isOpen ? '#F9A138' : '#94A3B8'
    const todayHours = r.hours[status.todayKey]
    return `
      <div style="font-family:'DM Sans',sans-serif;padding:16px;min-width:220px;max-width:280px;">
        <div style="font-family:'Outfit',sans-serif;font-weight:700;font-size:15px;color:#1A1A1A;margin-bottom:4px;line-height:1.3;">
          ${r.name}
        </div>
        <div style="font-size:12px;color:#64748B;margin-bottom:8px;line-height:1.4;">
          ${r.address}
        </div>
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:${distance ? '6px' : '12px'};">
          <span style="width:7px;height:7px;border-radius:50%;background:${statusColor};display:inline-block;flex-shrink:0;"></span>
          <span style="font-size:12px;font-weight:600;color:${statusColor};">${status.label}</span>
          ${todayHours !== 'Fechado' ? `<span style="font-size:11px;color:#94A3B8;margin-left:2px;">(${todayHours})</span>` : ''}
        </div>
        ${distance ? `
          <div style="font-size:11px;font-weight:600;color:#F9A138;margin-bottom:12px;">
            ${distance} away
          </div>
        ` : ''}
        <div style="display:flex;gap:6px;">
          <a href="${detailUrl}"
            style="
              flex:1;display:inline-flex;align-items:center;justify-content:center;gap:5px;
              background:#F1F5F9;color:#1A1A1A;
              padding:7px 10px;border-radius:8px;
              font-size:11px;font-weight:600;
              text-decoration:none;letter-spacing:0.01em;
            "
            onmouseover="this.style.background='#E2E8F0'"
            onmouseout="this.style.background='#F1F5F9'"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            View Details
          </a>
          <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer"
            style="
              flex:1;display:inline-flex;align-items:center;justify-content:center;gap:5px;
              background:#1A1A1A;color:white;
              padding:7px 10px;border-radius:8px;
              font-size:11px;font-weight:600;
              text-decoration:none;letter-spacing:0.01em;
            "
            onmouseover="this.style.background='#2D2D2D'"
            onmouseout="this.style.background='#1A1A1A'"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="3 11 22 2 13 21 11 13 3 11"/>
            </svg>
            Directions
          </a>
        </div>
      </div>
    `
  }, [])

  // Initialize map once
  useEffect(() => {
    if (initRef.current || !containerRef.current) return
    initRef.current = true

    let L: typeof import('leaflet')

    async function init() {
      const leaflet = await import('leaflet')
      L = leaflet.default ?? leaflet

      // Fix Leaflet default icon paths in Next.js
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      // Import Leaflet CSS
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link')
        link.id = 'leaflet-css'
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }

      // Portugal center
      const map = L.map(containerRef.current!, {
        center: [39.6, -8.0],
        zoom: 6,
        zoomControl: false,
        attributionControl: true,
      })

      // Zoom control — top right
      L.control.zoom({ position: 'bottomright' }).addTo(map)

      // Tiles — CartoDB Positron (clean minimal style)
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
          maxZoom: 19,
          subdomains: 'abcd',
        },
      ).addTo(map)

      mapRef.current = map
      ;(window as typeof window & { __evoltMap?: LeafletMap; __evoltL?: typeof L }).__evoltMap = map
      ;(window as typeof window & { __evoltMap?: LeafletMap; __evoltL?: typeof L }).__evoltL = L
    }

    init()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markersRef.current.clear()
        initRef.current = false
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update markers when resellers or selection changes
  useEffect(() => {
    const map = mapRef.current
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = (window as any).__evoltL as typeof import('leaflet') | undefined
    if (!map || !L) {
      // Map not ready yet — retry after short delay
      const t = setTimeout(() => {
        updateMarkers()
      }, 300)
      return () => clearTimeout(t)
    }
    updateMarkers()

    function updateMarkers() {
      const m = mapRef.current
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Lx = (window as any).__evoltL as typeof import('leaflet') | undefined
      if (!m || !Lx) return

      // Remove old markers
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current.clear()

      if (!resellers.length) return

      const bounds: [number, number][] = []

      resellers.forEach((r) => {
        const isSelected = r.id === selectedId
        const icon = buildIcon(Lx, isSelected)
        const marker = Lx.marker([r.lat, r.lng], { icon, title: r.name })
          .addTo(m)
          .bindPopup(buildPopup(r), {
            closeButton: false,
            maxWidth: 300,
          })

        marker.on('click', () => {
          onSelectReseller(r.id)
          marker.openPopup()
        })

        if (isSelected) {
          setTimeout(() => {
            marker.openPopup()
          }, 50)
        }

        markersRef.current.set(r.id, marker)
        bounds.push([r.lat, r.lng])
      })

      // Fit bounds on reseller list change (not just selection change)
      if (bounds.length > 0) {
        try {
          m.fitBounds(bounds as [number, number][], { padding: [48, 48], maxZoom: 13 })
        } catch {}
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resellers])

  // Pan to selected without refitting all bounds
  useEffect(() => {
    if (!selectedId || !mapRef.current) return
    const marker = markersRef.current.get(selectedId)
    if (!marker) return
    const latlng = marker.getLatLng()
    mapRef.current.panTo(latlng, { animate: true, duration: 0.5 })
  }, [selectedId])

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ minHeight: 300 }}
      aria-label="Reseller map"
    />
  )
}
