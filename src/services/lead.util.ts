import { GoldPurity } from '../prisma/generated/enums';

const KARAT_TO_GOLD_PURITY: Record<18 | 22 | 24, GoldPurity> = {
  18: GoldPurity.K18,
  22: GoldPurity.K22,
  24: GoldPurity.K24,
};

export function toGoldPurity(purityKarat: 18 | 22 | 24): GoldPurity {
  return KARAT_TO_GOLD_PURITY[purityKarat];
}

export function calculatePureGoldWeight(
  netWeightGrams: number,
  purityKarat: 18 | 22 | 24,
): number {
  return netWeightGrams * (purityKarat / 24);
}

export function calculateMaxEligibleLoan(
  pureGoldWeight: number,
  goldRatePerGram: number,
  maxLtvRatio: number,
): number {
  const goldValue = pureGoldWeight * goldRatePerGram;
  return goldValue * maxLtvRatio;
}
