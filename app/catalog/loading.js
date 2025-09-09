export default function CatalogLoading() {
  return (
    <main className="max-w-6xl mx-auto px-3 sm:px-6 py-10 space-y-8">
      {/* Header Skeleton */}
      <section className="text-center space-y-6">
        <div className="mb-4">
          <div className="mx-auto w-48 h-48 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        
        <div className="h-8 bg-gray-200 rounded-lg w-96 mx-auto animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded-lg w-80 mx-auto animate-pulse"></div>
        
        {/* Search Skeleton */}
        <div className="relative max-w-md mx-auto">
          <div className="w-full h-12 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </section>

      {/* Categories Grid Skeleton */}
      <section>
        <div className="h-6 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="card bg-base-100 shadow-xl border animate-pulse">
              <figure className="h-64 w-full max-h-64 bg-gray-200 flex items-center justify-center">
                <div className="w-16 h-16 bg-gray-300 rounded"></div>
              </figure>
              <div className="card-body p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-5 bg-gray-300 rounded w-24"></div>
                  <div className="h-6 bg-gray-300 rounded w-16"></div>
                </div>
                <div className="h-3 bg-gray-300 rounded w-20 mb-4"></div>
                <div className="mt-3">
                  <div className="h-3 bg-gray-300 rounded w-32 mb-2"></div>
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between rounded-md px-3 py-2 border bg-gray-50">
                        <div className="h-4 bg-gray-300 rounded w-20"></div>
                        <div className="flex items-center gap-2">
                          <div className="h-4 bg-gray-300 rounded w-12"></div>
                          <div className="h-5 bg-gray-300 rounded w-12"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mobile Bottom Bar Skeleton */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-[9999]">
        <div className="flex items-center justify-between px-1 py-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex flex-col items-center gap-1 p-2 min-w-0 flex-1">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-8 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
