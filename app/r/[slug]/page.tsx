import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getResellerBySlug, allResellers } from '@/lib/resellers'
import { STORE_TYPE_LABELS, STORE_TYPE_COLORS, DAY_LABELS } from '@/lib/types'
import { ResellerDetailMap } from '@/components/ResellerDetailMap'
import { OpenStatusBadge } from '@/components/OpenStatusBadge'
import { ResellerDetailPhoto } from '@/components/ResellerDetailPhoto'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return allResellers.map((r) => ({ slug: r.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const r = getResellerBySlug(slug)
  if (!r) return {}

  return {
    title: `${r.name} — Evolt Reseller in ${r.city}`,
    description: `Find ${r.name} at ${r.address}. Official Evolt electric mobility reseller — ${STORE_TYPE_LABELS[r.storeType]} in ${r.city}.`,
    openGraph: {
      title: `${r.name} — Evolt Reseller`,
      description: `${r.address} · ${r.phone}`,
      type: 'website',
    },
  }
}

export default async function ResellerDetailPage({ params }: Props) {
  const { slug } = await params
  const r = getResellerBySlug(slug)
  if (!r) notFound()

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lng}`

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: r.name,
    url: r.website,
    telephone: r.phone,
    email: r.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: r.address.split(',')[0]?.trim() ?? r.address,
      addressLocality: r.city,
      postalCode: r.postcode,
      addressRegion: r.region,
      addressCountry: r.countryCode,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: r.lat,
      longitude: r.lng,
    },
    openingHoursSpecification: Object.entries(r.hours)
      .filter(([, v]) => v !== 'Fechado')
      .map(([day, hours]) => {
        const [open, close] = hours.split('-')
        const dayMap: Record<string, string> = {
          mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday',
          thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
        }
        return {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: dayMap[day],
          opens: open,
          closes: close,
        }
      }),
    additionalType: STORE_TYPE_LABELS[r.storeType],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-evolt-surface">
        {/* Header */}
        <header className="bg-white border-b border-evolt-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
            <Link
              href="/embed"
              className="flex items-center gap-2 text-evolt-muted hover:text-evolt-navy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-evolt-green rounded-lg p-1"
              aria-label="Back to reseller locator"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-evolt-green rounded-lg flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <span className="font-display font-bold text-evolt-navy">Evolt</span>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: Info panel */}
            <div className="lg:col-span-2 space-y-4">
              {/* Name + type */}
              <div className="bg-white rounded-2xl border border-evolt-border p-6 shadow-card">
                <div className="flex items-start gap-4 mb-4">
                  <ResellerDetailPhoto src={r.image} name={r.name} />
                  <div>
                    <h1 className="font-display font-bold text-xl text-evolt-navy leading-tight">{r.name}</h1>
                    <span className={`inline-flex items-center mt-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STORE_TYPE_COLORS[r.storeType]}`}>
                      {STORE_TYPE_LABELS[r.storeType]}
                    </span>
                  </div>
                </div>

                {/* Contact info */}
                <div className="space-y-3">
                  <ContactRow icon="map-pin">
                    <span className="text-sm text-evolt-navy">{r.address}</span>
                  </ContactRow>
                  <ContactRow icon="phone">
                    <a href={`tel:${r.phone}`} className="text-sm text-evolt-navy hover:text-evolt-green transition-colors">
                      {r.phone}
                    </a>
                  </ContactRow>
                  <ContactRow icon="mail">
                    <a href={`mailto:${r.email}`} className="text-sm text-evolt-navy hover:text-evolt-green transition-colors truncate">
                      {r.email}
                    </a>
                  </ContactRow>
                  {r.website && (
                    <ContactRow icon="globe">
                      <a href={r.website} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-evolt-green hover:underline truncate">
                        {r.website.replace(/^https?:\/\//, '')}
                      </a>
                    </ContactRow>
                  )}
                </div>

                {/* CTA */}
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    mt-5 flex items-center justify-center gap-2
                    w-full py-3 rounded-xl
                    bg-evolt-navy text-white text-sm font-semibold
                    hover:bg-evolt-navy-light active:scale-[0.98]
                    transition-all duration-150
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-evolt-green
                  "
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                  </svg>
                  Get Directions
                </a>
              </div>

              {/* Photo gallery */}
              {r.photos && r.photos.length > 0 && (
                <div className="bg-white rounded-2xl border border-evolt-border overflow-hidden shadow-card">
                  <div className={`grid gap-0.5 ${r.photos.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {r.photos.slice(0, 3).map((src, i) => (
                      <div
                        key={i}
                        className={`overflow-hidden bg-evolt-surface ${r.photos!.length === 3 && i === 0 ? 'col-span-2' : ''}`}
                        style={{ aspectRatio: r.photos!.length === 1 ? '16/7' : '4/3' }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt={`${r.name} photo ${i + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hours */}
              <div className="bg-white rounded-2xl border border-evolt-border p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-bold text-sm text-evolt-navy">Opening Hours</h2>
                  <OpenStatusBadge hours={r.hours} size="md" />
                </div>
                <HoursTable hours={r.hours} />
              </div>
            </div>

            {/* Right: Map */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-evolt-border overflow-hidden shadow-card" style={{ height: 480 }}>
                <ResellerDetailMap lat={r.lat} lng={r.lng} name={r.name} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

function HoursTable({ hours }: { hours: import('@/lib/types').ResellerHours }) {
  // Determine today's key in Lisbon time
  const todayKey = (() => {
    try {
      const day = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Europe/Lisbon',
        weekday: 'short',
      }).format(new Date()).toLowerCase().slice(0, 3)
      const valid = ['mon','tue','wed','thu','fri','sat','sun']
      return valid.includes(day) ? day : null
    } catch { return null }
  })()

  return (
    <div className="space-y-1.5">
      {(Object.entries(hours) as [keyof typeof hours, string][]).map(([day, h]) => {
        const isToday = day === todayKey
        return (
          <div
            key={day}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-sm ${
              isToday ? 'bg-evolt-green/8 ring-1 ring-evolt-green/20' : ''
            }`}
          >
            <span className={`w-24 shrink-0 ${isToday ? 'font-semibold text-evolt-navy' : 'text-evolt-slate'}`}>
              {DAY_LABELS[day]}
              {isToday && <span className="ml-1.5 text-[10px] font-bold text-evolt-green uppercase tracking-wide">Today</span>}
            </span>
            <span className={`font-mono text-xs ${h === 'Fechado' ? 'text-evolt-muted' : isToday ? 'text-evolt-navy font-bold' : 'text-evolt-navy font-semibold'}`}>
              {h}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function ContactRow({ icon, children }: { icon: string; children: React.ReactNode }) {
  const icons: Record<string, React.ReactNode> = {
    'map-pin': (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00C896" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    phone: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00C896" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.5a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
    mail: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00C896" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    globe: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00C896" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
  }

  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 shrink-0">{icons[icon]}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
