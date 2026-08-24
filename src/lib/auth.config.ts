import type { NextAuthConfig } from 'next-auth';

/**
 * Edge-safe half of the auth setup.
 *
 * Middleware runs on the edge runtime, where neither Prisma nor bcrypt can be
 * imported. So the pieces middleware needs — session strategy, callbacks, the
 * route-authorisation rules — live here with NO database access, and the
 * Credentials provider (which must hash-compare against Postgres) is bolted
 * on in `auth.ts`, which only ever runs in Node.
 */

/** Routes that require any signed-in user. */
const CUSTOMER_PREFIXES = ['/account'];
/** Routes that require role === ADMIN. */
const ADMIN_PREFIXES = ['/studio'];

export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 30 },
  trustHost: true,
  providers: [], // filled in by auth.ts
  callbacks: {
    // Role and id are stamped into the JWT at sign-in so middleware can gate
    // /studio without a database round trip on every request.
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role?: string }).role ?? 'CUSTOMER';
        token.name = user.name ?? token.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? token.sub!;
        session.user.role = (token.role as 'CUSTOMER' | 'ADMIN') ?? 'CUSTOMER';
      }
      return session;
    },
    authorized({ auth, request }) {
      const { pathname, search } = request.nextUrl;
      const role = auth?.user?.role;
      const isLoggedIn = Boolean(auth?.user);

      if (ADMIN_PREFIXES.some((p) => pathname.startsWith(p))) {
        // Anyone who is not an admin is bounced to the sign-in page rather
        // than shown a 403 — the studio should not advertise that it exists.
        if (role !== 'ADMIN') {
          const url = new URL('/login', request.nextUrl.origin);
          url.searchParams.set('callbackUrl', pathname + search);
          return Response.redirect(url);
        }
        return true;
      }

      if (CUSTOMER_PREFIXES.some((p) => pathname.startsWith(p))) {
        if (!isLoggedIn) {
          const url = new URL('/login', request.nextUrl.origin);
          url.searchParams.set('callbackUrl', pathname + search);
          return Response.redirect(url);
        }
        return true;
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
