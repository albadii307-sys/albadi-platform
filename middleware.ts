import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_FILE = /\.(?:png|jpe?g|webp|svg|ico|pdf|txt|xml|woff2?)$/i;

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/media') ||
    pathname.startsWith('/uploads') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/ar${search}`, request.url));
  }

  if (pathname.startsWith('/admin')) {
    const session = request.cookies.get('albadi_admin')?.value;
    if (!session && pathname !== '/admin/login') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    const headers = new Headers(request.headers);
    headers.set('x-locale', 'ar');
    return NextResponse.next({ request: { headers } });
  }

  const headers = new Headers(request.headers);
  headers.set('x-locale', pathname.startsWith('/en') ? 'en' : 'ar');
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
