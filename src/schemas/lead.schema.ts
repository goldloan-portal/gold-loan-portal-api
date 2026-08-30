import { z } from 'zod';

const goldWeightFields = {
  grossWeightGrams: z.number().positive('Gross weight must be positive'),
  netWeightGrams: z.number().positive('Net weight must be positive'),
  purityKarat: z.literal([18, 22, 24], {
    error: 'Purity karat must be 18, 22, or 24',
  }),
};

export const createLeadSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  mobileNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Mobile number must be a valid 10-digit number'),
  ...goldWeightFields,
  selectedPlanId: z.uuid('Selected plan ID must be a valid UUID'),
});

export const calculateLeadSchema = z.object(goldWeightFields);

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type CalculateLeadInput = z.infer<typeof calculateLeadSchema>;
