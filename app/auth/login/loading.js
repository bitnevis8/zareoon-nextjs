export default function LoginLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header Loading */}
        <div className="text-center animate-pulse">
          <div className="h-12 bg-gray-300 rounded-lg mb-4 w-1/2 mx-auto"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
        </div>

        {/* Login Form Loading */}
        <div className="bg-white rounded-lg shadow-md p-8 animate-pulse">
          <div className="space-y-6">
            {/* Email Field */}
            <div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>

            {/* Password Field */}
            <div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-24 mr-2"></div>
            </div>

            {/* Submit Button */}
            <div className="h-12 bg-blue-300 rounded"></div>

            {/* Links */}
            <div className="text-center space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 