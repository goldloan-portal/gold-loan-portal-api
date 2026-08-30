import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'src/prisma/schema',
  migrations: {
    path: 'src/prisma/schema/migrations',
    seed: 'tsx src/prisma/seed.ts',
  },
  datasource: {
    url: process.env['DATABASE_SESSION_POOLER_URL'],
  },
});
