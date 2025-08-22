import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Prime Lux Events - Luxury Event Rentals & Venue | Connecticut, NY, NJ',
  description: 'Transform your celebration with Prime Lux Events luxury rental collection. Premium tables, chairs, decor & our stunning Shelton venue. Serving CT, RI, MA, NY, NJ.',
  keywords: 'luxury event rentals, wedding rentals, party rentals Connecticut, event venue Shelton CT, premium furniture rental, corporate event rentals',
  openGraph: {
    title: 'Prime Lux Events - Luxury Event Rentals & Venue',
    description: 'Transform your celebration with Prime Lux Events luxury rental collection.',
    url: 'https://primeluxevents.com',
    siteName: 'Prime Lux Events',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased bg-gradient-to-br from-slate-50 via-white to-gold-50`}>
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}