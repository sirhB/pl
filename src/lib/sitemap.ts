import { MetadataRoute } from 'next'

interface SitemapEntry {
  url: string
  lastModified?: string | Date
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
}

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://primeluxevents.com'

// Static pages sitemap
export const staticPagesSitemap: SitemapEntry[] = [
  {
    url: `${SITE_URL}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 1.0
  },
  {
    url: `${SITE_URL}/about`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8
  },
  {
    url: `${SITE_URL}/services`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9
  },
  {
    url: `${SITE_URL}/products`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9
  },
  {
    url: `${SITE_URL}/venues`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8
  },
  {
    url: `${SITE_URL}/venues/prime-lux-event-hall`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8
  },
  {
    url: `${SITE_URL}/gallery`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7
  },
  {
    url: `${SITE_URL}/contact`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7
  },
  {
    url: `${SITE_URL}/faq`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6
  },
  {
    url: `${SITE_URL}/consultation`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7
  }
]

// Product categories sitemap
export const productCategoriesSitemap: SitemapEntry[] = [
  {
    url: `${SITE_URL}/products/seating`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8
  },
  {
    url: `${SITE_URL}/products/tables`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8
  },
  {
    url: `${SITE_URL}/products/lighting`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8
  },
  {
    url: `${SITE_URL}/products/linens`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8
  },
  {
    url: `${SITE_URL}/products/decor`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8
  },
  {
    url: `${SITE_URL}/products/bars-lounges`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8
  },
  {
    url: `${SITE_URL}/products/tents-structures`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7
  },
  {
    url: `${SITE_URL}/products/dance-floors`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7
  }
]

// Generate dynamic product pages sitemap
export async function generateProductsSitemap(): Promise<SitemapEntry[]> {
  try {
    // In a real implementation, you would fetch products from your database
    // For now, we'll use mock data
    const mockProducts = [
      { id: 'gold-chiavari-chairs', slug: 'gold-chiavari-chairs', updated_at: new Date() },
      { id: 'crystal-chandeliers', slug: 'crystal-chandeliers', updated_at: new Date() },
      { id: 'vintage-farm-tables', slug: 'vintage-farm-tables', updated_at: new Date() },
      { id: 'elegant-linens', slug: 'elegant-linens', updated_at: new Date() },
      { id: 'led-uplighting', slug: 'led-uplighting', updated_at: new Date() }
    ]

    return mockProducts.map(product => ({
      url: `${SITE_URL}/products/${product.slug}`,
      lastModified: product.updated_at,
      changeFrequency: 'weekly' as const,
      priority: 0.7
    }))
  } catch (error) {
    console.error('Error generating products sitemap:', error)
    return []
  }
}

// Generate robots.txt content
export function generateRobotsTxt(): string {
  const robotsTxt = `
# Robots.txt for Prime Lux Events
User-agent: *
Allow: /

# Disallow admin and private areas
Disallow: /admin
Disallow: /api
Disallow: /dashboard
Disallow: /_next
Disallow: /checkout
Disallow: /account

# Allow specific API endpoints for SEO
Allow: /api/sitemap

# Sitemap location
Sitemap: ${SITE_URL}/sitemap.xml

# Crawl delay
Crawl-delay: 1
  `.trim()

  return robotsTxt
}

// Main sitemap generation function
export async function generateSitemap(): Promise<MetadataRoute.Sitemap> {
  const dynamicProducts = await generateProductsSitemap()
  
  const allEntries = [
    ...staticPagesSitemap,
    ...productCategoriesSitemap,
    ...dynamicProducts
  ]

  return allEntries.map(entry => ({
    url: entry.url,
    lastModified: entry.lastModified || new Date(),
    changeFrequency: entry.changeFrequency || 'weekly',
    priority: entry.priority || 0.5
  }))
}

// Generate XML sitemap string
export async function generateXMLSitemap(): Promise<string> {
  const sitemap = await generateSitemap()
  
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemap.map(entry => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${new Date(entry.lastModified!).toISOString()}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  return xmlContent
}

// Generate sitemap index for large sites
export function generateSitemapIndex(): string {
  const sitemapIndexContent = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap-pages.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-products.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-categories.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
</sitemapindex>`

  return sitemapIndexContent
}

// Utility functions for SEO URLs
export const seoUtils = {
  // Generate SEO-friendly slug from string
  generateSlug: (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-')
      .replace(/^-+|-+$/g, '')
  },

  // Generate canonical URL
  generateCanonicalUrl: (path: string): string => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    return `${SITE_URL}${cleanPath}`
  },

  // Validate URL structure
  isValidUrl: (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  },

  // Generate meta description from content
  generateMetaDescription: (content: string, maxLength: number = 160): string => {
    const cleanContent = content.replace(/<[^>]*>/g, '').trim()
    if (cleanContent.length <= maxLength) return cleanContent
    
    const truncated = cleanContent.substring(0, maxLength)
    const lastSpace = truncated.lastIndexOf(' ')
    
    return lastSpace > 0 
      ? truncated.substring(0, lastSpace) + '...'
      : truncated + '...'
  },

  // Generate alt text for images
  generateAltText: (filename: string, context?: string): string => {
    const baseName = filename
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/[-_]/g, ' ')   // Replace dashes and underscores with spaces
      .replace(/\b\w/g, l => l.toUpperCase()) // Capitalize words
    
    if (context) {
      return `${baseName} - ${context} | Prime Lux Events`
    }
    
    return `${baseName} | Prime Lux Events`
  }
}

// SEO audit utilities
export const seoAudit = {
  // Check if page has required meta tags
  validateMetaTags: (metadata: {
    title?: string
    description?: string
    keywords?: string[]
    canonical?: string
  }) => {
    const issues: string[] = []
    
    if (!metadata.title) {
      issues.push('Missing title tag')
    } else if (metadata.title.length > 60) {
      issues.push('Title tag too long (over 60 characters)')
    }
    
    if (!metadata.description) {
      issues.push('Missing meta description')
    } else if (metadata.description.length > 160) {
      issues.push('Meta description too long (over 160 characters)')
    }
    
    if (!metadata.keywords || metadata.keywords.length === 0) {
      issues.push('Missing meta keywords')
    }
    
    if (!metadata.canonical) {
      issues.push('Missing canonical URL')
    }
    
    return {
      isValid: issues.length === 0,
      issues
    }
  },

  // Check image optimization
  validateImages: (images: Array<{ src: string; alt?: string; width?: number; height?: number }>) => {
    const issues: string[] = []
    
    images.forEach((img, index) => {
      if (!img.alt) {
        issues.push(`Image ${index + 1} missing alt text`)
      }
      
      if (!img.width || !img.height) {
        issues.push(`Image ${index + 1} missing dimensions`)
      }
      
      if (img.src && !img.src.includes('.webp') && !img.src.includes('.avif')) {
        issues.push(`Image ${index + 1} not using modern format (WebP/AVIF)`)
      }
    })
    
    return {
      isValid: issues.length === 0,
      issues
    }
  }
}

// Export constants
export const SEO_LIMITS = {
  TITLE_MAX_LENGTH: 60,
  DESCRIPTION_MAX_LENGTH: 160,
  KEYWORDS_MAX_COUNT: 10,
  ALT_TEXT_MAX_LENGTH: 125
} as const