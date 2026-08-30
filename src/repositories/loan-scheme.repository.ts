import { prisma } from '../lib/prisma';
import type { LoanSchemeModel } from '../prisma/generated/models';

// READS
export async function getLoanSchemes(): Promise<LoanSchemeModel[]> {
  return prisma.loanScheme.findMany({ where: { isActive: true } });
}
