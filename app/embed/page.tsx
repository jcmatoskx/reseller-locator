import type { Metadata } from 'next'
import { ResellerLocator } from '@/components/ResellerLocator'
import { allResellers } from '@/lib/resellers'

export const metadata: Metadata = {
  title: 'Evolt — Reseller Locator',
  description: 'Find your nearest Evolt electric mobility reseller.',
  robots: { index: false, follow: false },
}

export default function EmbedPage() {
  return (
    <main className="flex flex-col h-screen overflow-hidden bg-white">
      <ResellerLocator resellers={allResellers} />
    </main>
  )
}
