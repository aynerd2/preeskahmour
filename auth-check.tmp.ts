/**
 * Throwaway: exercises the credential-verification path against the real
 * database, without NextAuth's HTTP plumbing — the local PGlite harness can
 * only serve one connection, so it cannot also feed a Next dev server.
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function authorize(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user?.passwordHash) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

async function main() {
  const cases: [string, string, string][] = [
    ['prisca@preeskahmour.com', 'Preeska2024!', 'owner, correct password'],
    ['demo@preeskahmour.com', 'Demo2024!', 'customer, correct password'],
    ['prisca@preeskahmour.com', 'wrong-password', 'owner, WRONG password'],
    ['nobody@example.com', 'whatever', 'unknown address'],
    ['PRISCA@PREESKAHMOUR.COM', 'Preeska2024!', 'owner, uppercased email'],
  ];

  for (const [email, password, label] of cases) {
    const result = await authorize(email, password);
    console.log(
      `${result ? '✔ signed in' : '✖ rejected '}  ${label.padEnd(30)} ${result ? `role=${result.role}` : ''}`,
    );
  }

  // Sanity-check the seeded catalogue is actually queryable.
  const counts = {
    fabrics: await prisma.fabric.count(),
    baseStyles: await prisma.baseStyle.count(),
    designOptions: await prisma.designOption.count(),
    products: await prisma.product.count(),
    orders: await prisma.order.count(),
    designs: await prisma.customDesign.count(),
    siteSettings: await prisma.siteSetting.count(),
  };
  console.log('\ncatalogue:', counts);

  // And that the frozen order snapshot survived the round trip.
  const order = await prisma.order.findFirst({ include: { items: true } });
  const snapshot = order?.items[0]?.measurementSnapshot as Record<string, unknown> | null;
  console.log('order:', order?.reference, '| total kobo:', order?.totalKobo);
  console.log('measurement snapshot bust/waist/hip:', snapshot?.bustCm, snapshot?.waistCm, snapshot?.hipCm);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
