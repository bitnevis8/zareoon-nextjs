import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // صفحاتی که نیاز به احراز هویت دارند
  const protectedRoutes = [
    '/dashboard',
    '/dashboard/farmer',
    '/dashboard/user-management',
    '/dashboard/order-management',
    '/dashboard/settings'
  ];
  
  // بررسی آیا مسیر محافظت شده است
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  if (isProtectedRoute) {
    // اگر در سمت سرور هستیم، فقط redirect کن
    // احراز هویت واقعی در AuthContext انجام می‌شود
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/dashboard'
  ]
};
