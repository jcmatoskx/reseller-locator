export type StoreType = 'quiosque' | 'tabacaria' | 'papelaria' | 'loja' | 'eletronica' | 'mercearia'

export interface ResellerHours {
  mon: string
  tue: string
  wed: string
  thu: string
  fri: string
  sat: string
  sun: string
}

export interface Reseller {
  id: string
  name: string
  slug: string
  countryCode: string
  countryName: string
  region: string
  city: string
  address: string
  postcode: string
  lat: number
  lng: number
  phone: string
  email: string
  website: string
  image?: string
  photos?: string[]
  hours: ResellerHours
  storeType: StoreType
  active: boolean
}

export interface ResellerWithDistance extends Reseller {
  distance?: number // km
}

export interface GeoLocation {
  lat: number
  lng: number
  label: string
}

export interface FilterState {
  query: string
  country: string
  storeType: StoreType | ''
}

export const STORE_TYPE_LABELS: Record<StoreType, string> = {
  quiosque:   'Quiosque',
  tabacaria:  'Tabacaria',
  papelaria:  'Papelaria',
  loja:       'Loja',
  eletronica: 'Eletrónica',
  mercearia:  'Mercearia',
}

export const STORE_TYPE_ICONS: Record<StoreType, string> = {
  quiosque:   '🏪',
  tabacaria:  '🚬',
  papelaria:  '📚',
  loja:       '🏬',
  eletronica: '⚡',
  mercearia:  '🛒',
}

export const STORE_TYPE_COLORS: Record<StoreType, string> = {
  quiosque:   'bg-amber-50 text-amber-700',
  tabacaria:  'bg-orange-50 text-orange-700',
  papelaria:  'bg-violet-50 text-violet-700',
  loja:       'bg-blue-50 text-blue-700',
  eletronica: 'bg-evolt-green/10 text-evolt-green-dark',
  mercearia:  'bg-teal-50 text-teal-700',
}

export const DAY_LABELS: Record<keyof ResellerHours, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
}

export const ALL_STORE_TYPES: StoreType[] = [
  'loja', 'eletronica', 'quiosque', 'tabacaria', 'papelaria', 'mercearia',
]
