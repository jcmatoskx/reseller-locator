import type { GeoLocation } from './types'

interface NominatimResult {
  lat: string
  lon: string
  display_name: string
}

// Simple in-memory cache — persists for the session
const cache = new Map<string, GeoLocation | null>()

// Rate limiting: track last request timestamp
let lastRequestTime = 0
const MIN_INTERVAL_MS = 1100 // > 1 req/sec per Nominatim policy

async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Geocode a query string using Nominatim (OpenStreetMap).
 * Respects usage policy: max 1 req/sec, with caching.
 */
export async function geocode(query: string): Promise<GeoLocation | null> {
  const key = query.trim().toLowerCase()
  if (!key) return null

  if (cache.has(key)) return cache.get(key)!

  // Enforce rate limit
  const now = Date.now()
  const elapsed = now - lastRequestTime
  if (elapsed < MIN_INTERVAL_MS) {
    await wait(MIN_INTERVAL_MS - elapsed)
  }

  try {
    lastRequestTime = Date.now()
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=pt`
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'pt-PT,pt;q=0.9,en;q=0.8',
        'User-Agent': 'EvoltResellerLocator/1.0 (evolt.pt)',
      },
    })

    if (!res.ok) {
      cache.set(key, null)
      return null
    }

    const data: NominatimResult[] = await res.json()
    if (!data.length) {
      cache.set(key, null)
      return null
    }

    const result: GeoLocation = {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      label: data[0].display_name,
    }
    cache.set(key, result)
    return result
  } catch {
    cache.set(key, null)
    return null
  }
}

/**
 * Get the user's current position via the browser Geolocation API.
 */
export function getBrowserLocation(): Promise<GeoLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: 'My location',
        })
      },
      (err) => reject(err),
      { timeout: 10_000 },
    )
  })
}
