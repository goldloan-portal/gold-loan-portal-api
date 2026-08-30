import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

import { PrismaClient } from './generated/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_SESSION_POOLER_URL,
});
const prisma = new PrismaClient({ adapter });

const loanSchemes = [
  { name: 'Bullet Repayment Plan', interestRate: 12.5, maxLtv: 75.0 },
  { name: 'Monthly EMI Plan', interestRate: 10.5, maxLtv: 75.0 },
];

async function main(): Promise<void> {
  for (const scheme of loanSchemes) {
    await prisma.loanScheme.upsert({
      where: { name: scheme.name },
      create: scheme,
      update: scheme,
    });
    console.log(`Seeded loan scheme: ${scheme.name}`);
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
