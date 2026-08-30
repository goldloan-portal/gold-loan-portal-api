import { GOLD_RATE_PER_GRAM, MAX_LTV_RATIO } from '../config/gold-loan.config';
import { DuplicateLeadError } from '../lib/errors/duplicate-lead.error';
import { LoanSchemeNotFoundError } from '../lib/errors/loan-scheme-not-found.error';
import { ValidationError } from '../lib/errors/validation.error';
import type { LeadModel } from '../prisma/generated/models';
import * as leadRepository from '../repositories/lead.repository';
import type { CreateLeadInput } from '../schemas/lead.schema';
import type { LeadWithPlan } from '../types/lead.types';
import {
  calculateMaxEligibleLoan,
  calculatePureGoldWeight,
  toGoldPurity,
} from './lead.util';
import * as loanSchemeService from './loan-scheme.service';

const DEDUP_WINDOW_DAYS = 7;

// READS
export async function getLeads(): Promise<LeadWithPlan[]> {
  return leadRepository.getLeads();
}

// WRITES
export async function createLead(input: CreateLeadInput): Promise<LeadModel> {
  ensureNetWeightNotExceedingGross(
    input.netWeightGrams,
    input.grossWeightGrams,
  );
  await ensureLoanSchemeExists(input.selectedPlanId);
  await ensureLeadIsNotDuplicate(input.mobileNumber);

  const pureGoldWeight = calculatePureGoldWeight(
    input.netWeightGrams,
    input.purityKarat,
  );
  const maxEligibleLoan = calculateMaxEligibleLoan(
    pureGoldWeight,
    GOLD_RATE_PER_GRAM,
    MAX_LTV_RATIO,
  );

  return leadRepository.createLead({
    customerName: input.customerName,
    mobileNumber: input.mobileNumber,
    grossWeightGrams: input.grossWeightGrams,
    netWeightGrams: input.netWeightGrams,
    purityKarat: toGoldPurity(input.purityKarat),
    pureGoldWeight,
    maxEligibleLoan,
    selectedPlanId: input.selectedPlanId,
  });
}

// HELPERS
function ensureNetWeightNotExceedingGross(
  netWeightGrams: number,
  grossWeightGrams: number,
): void {
  if (netWeightGrams > grossWeightGrams) {
    throw new ValidationError([
      {
        field: 'netWeightGrams',
        message: 'Net weight must be less than or equal to gross weight',
      },
    ]);
  }
}

async function ensureLoanSchemeExists(selectedPlanId: string): Promise<void> {
  const loanScheme = await loanSchemeService.getLoanSchemeById(selectedPlanId);
  if (!loanScheme) {
    throw new LoanSchemeNotFoundError();
  }
}

async function ensureLeadIsNotDuplicate(mobileNumber: string): Promise<void> {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - DEDUP_WINDOW_DAYS);

  const recentLead = await leadRepository.getRecentLeadByMobileNumber(
    mobileNumber,
    since,
  );
  if (recentLead) {
    throw new DuplicateLeadError(mobileNumber);
  }
}
