import type { LoanSchemeModel } from '../prisma/generated/models';
import * as loanSchemeRepository from '../repositories/loan-scheme.repository';

// READS
export async function getLoanSchemes(): Promise<LoanSchemeModel[]> {
  return loanSchemeRepository.getLoanSchemes();
}

export async function getLoanSchemeById(
  id: string,
): Promise<LoanSchemeModel | null> {
  return loanSchemeRepository.getLoanSchemeById(id);
}
