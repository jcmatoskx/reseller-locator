import resellersData from '@/data/resellers.json'
import type { Reseller, ResellerWithDistance, FilterState } from './types'
import { haversineDistance } from './haversine'
import type { GeoLocation } from './types'

export const allResellers: Reseller[] = resellersData as Reseller[]

export function filterResellers(
  resellers: Reseller[],
  filters: FilterState,
): Reseller[] {
  const q = filters.query.toLowerCase().trim()

  return resellers.filter((r) => {
    if (!r.active) return false

    if (filters.country && r.countryCode !== filters.country) return false

    if (filters.storeType && r.storeType !== filters.storeType) return false

    if (q) {
      const haystack = [r.name, r.city, r.address, r.region, r.postcode]
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(q)) return false
    }

    return true
  })
}

export function attachDistances(
  resellers: Reseller[],
  location: GeoLocation | null,
): ResellerWithDistance[] {
  if (!location) return resellers.map((r) => ({ ...r }))

  return resellers.map((r) => ({
    ...r,
    distance: haversineDistance(location.lat, location.lng, r.lat, r.lng),
  }))
}

export function sortResellers(
  resellers: ResellerWithDistance[],
  hasLocation: boolean,
): ResellerWithDistance[] {
  return [...resellers].sort((a, b) => {
    if (hasLocation && a.distance !== undefined && b.distance !== undefined) {
      return a.distance - b.distance
    }
    const cityDiff = a.city.localeCompare(b.city, 'pt')
    if (cityDiff !== 0) return cityDiff
    return a.name.localeCompare(b.name, 'pt')
  })
}

export function getResellerBySlug(slug: string): Reseller | undefined {
  return allResellers.find((r) => r.slug === slug)
}
