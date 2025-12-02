import { Helmet } from 'react-helmet-async'

export interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  ogImage?: string
  ogType?: 'website' | 'article'
  canonical?: string
  noindex?: boolean
}

const DEFAULT_TITLE = 'Wishlist - Créez et partagez vos listes de souhaits'
const DEFAULT_DESCRIPTION =
  'Créez, gérez et partagez facilement vos listes de souhaits pour tous vos événements : anniversaires, mariages, Noël. Organisez vos cadeaux et faites plaisir à vos proches.'
const DEFAULT_KEYWORDS = 'liste de souhaits, wishlist, cadeaux, anniversaire, mariage, noël, partage, événements'
const DEFAULT_OG_IMAGE = 'https://wishlistapp.fr/logo_text_350x150.png'
const SITE_URL = 'https://wishlistapp.fr'

/**
 * SEO component for managing page metadata
 * Uses react-helmet-async to dynamically update meta tags
 */
export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  canonical,
  noindex = false,
}: SEOProps) {
  const fullTitle = title ? `${title} | Wishlist` : DEFAULT_TITLE
  const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : SITE_URL

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
    </Helmet>
  )
}
