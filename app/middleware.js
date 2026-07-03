import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/dashboard/farmer')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace('/dashboard/farmer', '/dashboard/supplier');
    return NextResponse.redirect(url, 308);
  }
  
  // صفحاتی که نیاز به احراز هویت دارند
  const protectedRoutes = [
    '/dashboard',
    '/dashboard/supplier',
    '/dashboard/user-management',
    '/dashboard/order-management',
    '/dashboard/account'
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
