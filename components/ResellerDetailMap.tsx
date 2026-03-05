'use client'

import { useEffect, useRef } from 'react'

interface ResellerDetailMapProps {
  lat: number
  lng: number
  name: string
}

export function ResellerDetailMap({ lat, lng, name }: ResellerDetailMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const initRef = useRef(false)

  useEffect(() => {
    if (initRef.current || !containerRef.current) return
    initRef.current = true

    async function init() {
      const leaflet = await import('leaflet')
      const L = leaflet.default ?? leaflet

      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link')
        link.id = 'leaflet-css'
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl

      const icon = L.divIcon({
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        html: `
          <div style="
            width:40px;height:40px;
            background:#F9A138;
            border:3px solid white;
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            box-shadow:0 4px 12px rgba(249,161,56,0.50);
          ">
            <div style="
              width:100%;height:100%;
              display:flex;align-items:center;justify-content:center;
              transform:rotate(45deg);
            ">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
          </div>
        `,
      })

      const map = L.map(containerRef.current!, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: false,
        scrollWheelZoom: false,
      })

      L.control.zoom({ position: 'bottomright' }).addTo(map)

      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
          maxZoom: 19,
          subdomains: 'abcd',
        },
      ).addTo(map)

      L.marker([lat, lng], { icon, title: name })
        .addTo(map)
        .bindPopup(`<strong style="font-family:'Outfit',sans-serif;">${name}</strong>`)
        .openPopup()
    }

    init()

    return () => {
      initRef.current = false
    }
  }, [lat, lng, name])

  return <div ref={containerRef} className="w-full h-full" aria-label={`Map location of ${name}`} />
}
