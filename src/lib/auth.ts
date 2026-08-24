import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

import { authConfig } from './auth.config';
import { prisma } from './prisma';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'Email and password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase().trim() },
        });
        if (!user?.passwordHash) return null;

        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
});

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

/** Throws unless the caller is signed in. Use at the top of server actions. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('UNAUTHENTICATED');
  return session.user;
}

/** Throws unless the caller is an admin. Every /studio mutation calls this. */
export async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') throw new Error('UNAUTHORIZED');
  return session.user;
}

/** Non-throwing variant for pages that merely personalise their output. */
export async function currentUser() {
  const session = await auth();
  return session?.user ?? null;
}
