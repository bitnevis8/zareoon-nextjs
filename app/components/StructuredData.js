export default function StructuredData({ articles = [] }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "زارعون",
    "url": (typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')),
    "logo": "/logo.png",
    "description": "بازار آنلاین خرید و فروش محصولات و نهاده‌های کشاورزی",
    "foundingDate": "2024",
    "sameAs": []
  };

  const articleStructuredData = [];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      {articleStructuredData.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(data)
          }}
        />
      ))}
    </>
  );
} 