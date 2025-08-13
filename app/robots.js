export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/dashboard/'],
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://zareoon.ir'}/sitemap.xml`,
  };
} 