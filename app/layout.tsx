import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Evolt Reseller Locator',
  description: 'Find your nearest Evolt electric mobility reseller in Portugal.',
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt" className={inter.variable}>
      <body className="bg-evolt-surface text-evolt-navy antialiased">
        {children}
      </body>
    </html>
  )
}
