export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zareoon.ir';
  
  const categoryUrls = [];

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
    // Add more base routes as needed
    ...categoryUrls,
  ];
} 