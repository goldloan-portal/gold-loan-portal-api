import type { GoldPurity } from '../prisma/generated/enums';

export type CreateLeadRecord = {
  customerName: string;
  mobileNumber: string;
  grossWeightGrams: number;
  netWeightGrams: number;
  purityKarat: GoldPurity;
  pureGoldWeight: number;
  maxEligibleLoan: number;
  selectedPlanId: string;
};

export type CreateLeadResponse = {
  applicationId: string;
};
