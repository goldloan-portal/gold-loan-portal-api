import type { LoanSchemeModel } from '../prisma/generated/models';
import * as loanSchemeRepository from '../repositories/loan-scheme.repository';

// READS
export async function getLoanSchemes(): Promise<LoanSchemeModel[]> {
  return loanSchemeRepository.getLoanSchemes();
}
