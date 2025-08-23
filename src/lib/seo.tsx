import Head from 'next/head'
import { Metadata } from 'next'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  canonical?: string
  image?: string
  type?: 'website' | 'article' | 'product' | 'business'
  locale?: string
  structuredData?: Record<string, any>
}

// SEO Component for pages
export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords = [],
  canonical,
  image,
  type = 'website',
  locale = 'en_US',
  structuredData
}) => {
  const siteTitle = 'Prime Lux Events'
  const siteDescription = 'Luxury event rentals in Connecticut. Premium furniture, lighting, and decor for weddings, corporate events, and special occasions. Serving Stamford, Greenwich, Norwalk, and surrounding areas.'
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://primeluxevents.com'
  
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle
  const metaDescription = description || siteDescription
  const metaImage = image || `${siteUrl}/images/og-image.jpg`
  const canonicalUrl = canonical || siteUrl

  const allKeywords = [
    'luxury event rentals',
    'wedding rentals Connecticut',
    'corporate event furniture',
    'party rentals Stamford',
    'event planning services',
    'premium event decor',
    ...keywords
  ]

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={allKeywords.join(', ')} />
      <meta name="author" content="Prime Lux Events" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content={locale} />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
      <meta name="twitter:site" content="@primeluxevents" />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#D4AF37" />
      <meta name="msapplication-TileColor" content="#D4AF37" />
      
      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
      )}
    </Head>
  )
}

// Generate metadata for Next.js App Router
export function generateMetadata({
  title,
  description,
  keywords = [],
  canonical,
  image,
  type = 'website'
}: SEOProps): Metadata {
  const siteTitle = 'Prime Lux Events'
  const siteDescription = 'Luxury event rentals in Connecticut. Premium furniture, lighting, and decor for weddings, corporate events, and special occasions.'
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://primeluxevents.com'
  
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle
  const metaDescription = description || siteDescription
  const metaImage = image || `${siteUrl}/images/og-image.jpg`

  const allKeywords = [
    'luxury event rentals',
    'wedding rentals Connecticut',
    'corporate event furniture',
    'party rentals Stamford',
    ...keywords
  ]

  return {
    title: fullTitle,
    description: metaDescription,
    keywords: allKeywords,
    authors: [{ name: 'Prime Lux Events' }],
    creator: 'Prime Lux Events',
    publisher: 'Prime Lux Events',
    robots: 'index, follow',
    alternates: {
      canonical: canonical || siteUrl
    },
    openGraph: {
      type: type as any,
      title: fullTitle,
      description: metaDescription,
      images: [metaImage],
      url: canonical || siteUrl,
      siteName: siteTitle,
      locale: 'en_US'
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: metaDescription,
      images: [metaImage],
      site: '@primeluxevents'
    },
    other: {
      'theme-color': '#D4AF37'
    }
  }
}

// Structured Data Generators
export const generateOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Prime Lux Events",
  "description": "Luxury event rental company specializing in premium furniture, lighting, and decor for weddings, corporate events, and special occasions in Connecticut.",
  "url": process.env.NEXT_PUBLIC_APP_URL || "https://primeluxevents.com",
  "logo": `${process.env.NEXT_PUBLIC_APP_URL || "https://primeluxevents.com"}/images/logo.png`,
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": process.env.COMPANY_PHONE || "(203) 555-0123",
    "contactType": "customer service",
    "email": process.env.COMPANY_EMAIL || "info@primeluxevents.com",
    "availableLanguage": ["English"]
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Business Street",
    "addressLocality": "Shelton",
    "addressRegion": "CT",
    "postalCode": "06484",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "41.3164",
    "longitude": "-73.0931"
  },
  "serviceArea": {
    "@type": "GeoCircle",
    "geoMidpoint": {
      "@type": "GeoCoordinates",
      "latitude": "41.3164",
      "longitude": "-73.0931"
    },
    "geoRadius": "50000"
  },
  "services": [
    "Wedding Rental Services",
    "Corporate Event Rentals",
    "Party Equipment Rental",
    "Event Furniture Rental",
    "Lighting Rental",
    "Decor Rental"
  ],
  "areaServed": [
    "Stamford, CT",
    "Greenwich, CT",
    "Norwalk, CT",
    "Bridgeport, CT",
    "New Haven, CT",
    "Hartford, CT"
  ]
})

export const generateLocalBusinessSchema = () => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Prime Lux Events",
  "image": `${process.env.NEXT_PUBLIC_APP_URL || "https://primeluxevents.com"}/images/hero-bg.jpg`,
  "@id": process.env.NEXT_PUBLIC_APP_URL || "https://primeluxevents.com",
  "url": process.env.NEXT_PUBLIC_APP_URL || "https://primeluxevents.com",
  "telephone": process.env.COMPANY_PHONE || "(203) 555-0123",
  "priceRange": "$$-$$$",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Business Street",
    "addressLocality": "Shelton",
    "addressRegion": "CT",
    "postalCode": "06484",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 41.3164,
    "longitude": -73.0931
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "08:00",
      "closes": "18:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Saturday"],
      "opens": "09:00",
      "closes": "17:00"
    }
  ]
})

export const generateProductSchema = (product: {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  availability: string
}) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": product.name,
  "description": product.description,
  "image": product.image,
  "category": product.category,
  "sku": product.id,
  "offers": {
    "@type": "Offer",
    "url": `${process.env.NEXT_PUBLIC_APP_URL}/products/${product.id}`,
    "priceCurrency": "USD",
    "price": product.price.toString(),
    "availability": product.availability === 'available' 
      ? "https://schema.org/InStock" 
      : "https://schema.org/OutOfStock",
    "seller": {
      "@type": "Organization",
      "name": "Prime Lux Events"
    }
  },
  "brand": {
    "@type": "Brand",
    "name": "Prime Lux Events"
  }
})

export const generateEventVenueSchema = () => ({
  "@context": "https://schema.org",
  "@type": "EventVenue",
  "name": "Prime Lux Event Hall",
  "description": "Elegant event venue perfect for weddings, corporate events, and special celebrations.",
  "url": `${process.env.NEXT_PUBLIC_APP_URL}/venues/prime-lux-event-hall`,
  "image": `${process.env.NEXT_PUBLIC_APP_URL}/images/venue-gallery-1.jpg`,
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Business Street",
    "addressLocality": "Shelton",
    "addressRegion": "CT",
    "postalCode": "06484",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 41.3164,
    "longitude": -73.0931
  },
  "maximumAttendeeCapacity": 200,
  "amenityFeature": [
    {
      "@type": "LocationFeatureSpecification",
      "name": "Parking",
      "value": true
    },
    {
      "@type": "LocationFeatureSpecification", 
      "name": "Wheelchair Accessible",
      "value": true
    },
    {
      "@type": "LocationFeatureSpecification",
      "name": "Air Conditioning",
      "value": true
    }
  ]
})

export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
})

export const generateServiceSchema = (service: {
  name: string
  description: string
  areaServed: string[]
  offers?: Array<{ name: string; price: number }>
}) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "name": service.name,
  "description": service.description,
  "provider": {
    "@type": "Organization",
    "name": "Prime Lux Events"
  },
  "areaServed": service.areaServed.map(area => ({
    "@type": "City",
    "name": area
  })),
  "offers": service.offers?.map(offer => ({
    "@type": "Offer",
    "name": offer.name,
    "price": offer.price.toString(),
    "priceCurrency": "USD"
  }))
})

// SEO Constants
export const SEO_CONSTANTS = {
  SITE_NAME: 'Prime Lux Events',
  SITE_DESCRIPTION: 'Luxury event rentals in Connecticut. Premium furniture, lighting, and decor for weddings, corporate events, and special occasions.',
  SITE_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://primeluxevents.com',
  COMPANY_NAME: 'Prime Lux Events',
  COMPANY_PHONE: process.env.COMPANY_PHONE || '(203) 555-0123',
  COMPANY_EMAIL: process.env.COMPANY_EMAIL || 'info@primeluxevents.com',
  SOCIAL_HANDLES: {
    twitter: '@primeluxevents',
    facebook: 'primeluxevents',
    instagram: 'primeluxevents'
  },
  DEFAULT_KEYWORDS: [
    'luxury event rentals',
    'wedding rentals Connecticut',
    'corporate event furniture',
    'party rentals Stamford',
    'event planning services',
    'premium event decor',
    'furniture rental CT',
    'lighting rental services',
    'event venue Connecticut'
  ]
}