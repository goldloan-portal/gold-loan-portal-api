import type { Prisma } from '../prisma/generated/client';
import type { GoldPurity, LeadStatus } from '../prisma/generated/enums';

export type LeadWithPlan = Prisma.LeadGetPayload<{
  include: { selectedPlan: true };
}>;

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

export type LeadResponse = {
  id: string;
  customerName: string;
  mobileNumber: string;
  netWeightGrams: number;
  status: LeadStatus;
  maxEligibleLoan: number;
  plan: { id: string; name: string };
  createdAt: Date;
};

export type CalculateLeadResponse = {
  pureGoldWeight: number;
  maxEligibleLoan: number;
};
