import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';

// Only the edge-safe config is used here — see lib/auth.config.ts for why.
export const { auth: middleware } = NextAuth(authConfig);

export default middleware;

export const config = {
  matcher: [
    /*
     * Run on every route except static assets, image optimisation, favicons
     * and the auth endpoints themselves.
     */
    '/((?!api/auth|_next/static|_next/image|placeholders|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
