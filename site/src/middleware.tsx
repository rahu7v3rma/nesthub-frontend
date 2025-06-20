import { NextRequest, NextResponse } from 'next/server';

import { ROUTES } from '@/constants';
import { getOTPVerified } from '@/utils/otp';

const publicRoutes = [
  ROUTES.signup,
  ROUTES.signin,
  ROUTES.resetPassword,
  ROUTES.verifyAccount,
];

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('authToken');
  const { pathname } = request.nextUrl;
  const isOTPVerified = getOTPVerified();

  const isPublicRoute =
    publicRoutes.includes(pathname) ||
    pathname.startsWith(ROUTES.resetPassword) ||
    pathname.startsWith(ROUTES.verifyAccount) ||
    pathname.startsWith(ROUTES.clientSetPassword) ||
    pathname.startsWith(ROUTES.resetPasswordRedirect);

  // If trying to access a private route without token
  if (!isPublicRoute && !authToken) {
    const signInUrl = new URL(ROUTES.signin, request.url);
    return NextResponse.redirect(signInUrl);
  }

  // If logged in and trying to access a public route (optional redirect)
  if (isPublicRoute && authToken) {
    const rootUrl = new URL(ROUTES.root, request.url);
    return NextResponse.redirect(rootUrl);
  }

  if (!isPublicRoute && authToken && !isOTPVerified) {
    return NextResponse.redirect(new URL(ROUTES.otpVerification, request.url));
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  // connect-src csp value should allow connecting to the backend (on
  // localhost:8000 when running locally and the backend base url when not) and
  // in development to the nextjs websocket
  const connectSrc =
    process.env.NODE_ENV === 'development'
      ? 'http://127.0.0.1:8000 ws://127.0.0.1:3000'
      : process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https: http: ${
      process.env.NODE_ENV === 'production' ? '' : `'unsafe-eval'`
    };
    style-src 'self' 'nonce-c29tZSBjb29sIHN0cmluZyB3aWxsIHBvcCB1cCAxMjM='
      'sha256-zlqnbDt84zf1iSefLU/ImC54isoprH/MRiVZGskwexk='
      'sha256-BIF8g/Yy8tQWDAZx7+G+OOOOtshfGzffchW3VfILKJE='
      'unsafe-hashes';
    img-src 'self' blob: data: ${process.env.NEXT_PUBLIC_BACKEND_BASE_URL} https://imagecdn.realty.com https://imagecdn.realty.dev https://www.realty.com https://a.tile.openstreetmap.org https://b.tile.openstreetmap.org https://c.tile.openstreetmap.org https://nh-test-backend-data-6692169cac8ab88c.s3.amazonaws.com;
    font-src 'self';
    object-src 'none';
    connect-src 'self' ${connectSrc};
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'self';
    frame-src 'self';
    upgrade-insecure-requests;
  `;

  // replace newline with spaces
  const contentSecurityPolicyHeaderValue = cspHeader
    .replace(/\s{2,}/g, ' ')
    .trim();

  // set the nonce and csp headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue,
  );

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue,
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Any path that includes a file extension (e.g., .svg, .png, .jpg)
     *   in the final segment. This aims to exclude requests for static assets
     *   served directly from the public folder.
     */
    {
      source:
        '/((?!api|_next/static|_next/image|favicon.ico|.*.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
