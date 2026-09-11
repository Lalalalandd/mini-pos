import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get('access_token')?.value;
  const userRole = request.cookies.get('user_role')?.value;

  // Protect Admin routes (/admin/*)
  if (pathname.startsWith('/admin')) {
    if (!accessToken || userRole !== 'ADMIN') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('unauthorized', 'admin');
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect POS Terminal routes (/pos/*)
  if (pathname.startsWith('/pos')) {
    if (!accessToken || (userRole !== 'ADMIN' && userRole !== 'CASHIER')) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('unauthorized', 'pos');
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/pos/:path*'],
};
