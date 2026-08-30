import type { Request, Response } from 'express';

import type { LoanSchemeModel } from '../prisma/generated/models';
import * as loanSchemeService from '../services/loan-scheme.service';
import type { LoanSchemeResponse } from '../types/loan-scheme.types';

// READS
export async function getLoanSchemes(
  _req: Request,
  res: Response,
): Promise<void> {
  const loanSchemes = await loanSchemeService.getLoanSchemes();
  res.json({ data: loanSchemes.map(toLoanSchemeResponse) });
}

// HELPERS
function toLoanSchemeResponse(loanScheme: LoanSchemeModel): LoanSchemeResponse {
  return {
    id: loanScheme.id,
    name: loanScheme.name,
    interestRate: loanScheme.interestRate.toNumber(),
    maxLtv: loanScheme.maxLtv.toNumber(),
  };
}
