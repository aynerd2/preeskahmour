/**
 * Throwaway: runs Postgres (PGlite, WASM) over a TCP socket so Prisma can
 * connect to it during verification. Not part of the project — this machine
 * has no Postgres and no Docker.
 */
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';

const db = await PGlite.create({ dataDir: process.argv[2] ?? './pgdata' });

const server = new PGLiteSocketServer({
  db,
  port: 5432,
  host: '127.0.0.1',
});

await server.start();
console.log('pglite listening on 127.0.0.1:5432');

process.on('SIGINT', async () => {
  await server.stop();
  await db.close();
  process.exit(0);
});
