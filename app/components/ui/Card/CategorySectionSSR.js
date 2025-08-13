import Card from './Card';
import Image from 'next/image';
import Link from 'next/link';
// Removed news-specific ShareButton import

// تابع کمکی برای نمایش زمان
function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now - date) / 1000); // seconds
  if (diff < 60) return 'چند ثانیه پیش';
  if (diff < 3600) return `${Math.floor(diff / 60)} دقیقه پیش`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ساعت پیش`;
  return `${Math.floor(diff / 86400)} روز پیش`;
}

// تابع کمکی برای تصویر ایمن
function SafeImage({ src, alt, ...props }) {
  if (!src) return <div className="w-full h-40 bg-gray-200 rounded mb-2" />;
  return (
    <div className="relative w-full h-40 mb-2">
      <Image
        src={src}
        alt={alt}
        width={400}
        height={160}
        className="object-cover rounded w-full h-40"
        {...props}
      />
    </div>
  );
}

export default function CategorySectionSSR({ category, articles }) {
  return (
    <Card title={category.name} className="mb-8">
      {!articles || articles.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          در حال حاضر خبری در این دسته‌بندی وجود ندارد.
        </div>
      ) : (
        <>
          {(() => {
            const [first, ...rest] = articles;
            return (
              <>
                {/* آخرین خبر با تصویر و استایل ویژه */}
                <div className="block bg-white rounded-lg shadow p-4 mb-4 border border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    {first.imageUrl && (
                      <div className="w-full sm:w-48 flex-shrink-0">
                        <SafeImage src={first.imageUrl} alt={first.title} />
                      </div>
                    )}
                    <div className="flex-1 flex flex-col justify-between h-full">
                      <h4 className="font-bold text-lg mb-2 line-clamp-2">{first.title}</h4>
                         <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
                           <span>{timeAgo(first.publishedAt)}</span>
                         </div>
                    </div>
                  </div>
                </div>
                
                {/* بقیه اخبار فقط متن */}
                {rest.length > 0 && (
                  <ul className="divide-y divide-gray-100">
                    {rest.map((article) => (
                      <li key={article.id}>
                        <div className="block py-3 px-2 rounded">
                                                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                             <span className="flex-1 text-sm font-medium text-gray-800 line-clamp-1 mb-2 sm:mb-0">{article.title}</span>
                             <div className="flex items-center gap-2 text-xs text-gray-400 min-w-fit justify-between">
                               <span>{timeAgo(article.publishedAt)}</span>
                             </div>
                           </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            );
          })()}
        </>
      )}
      
      {/* لینک بیشتر */}
      <div className="mt-4 text-center">
        <Link
          href={`/categories/${category.slug}`}
          className="inline-block px-4 py-2  text-slate-500 rounded hover:bg-cyan-100 transition"
        >
          مشاهده همه اخبار {category.name}
        </Link>
      </div>
    </Card>
  );
} 