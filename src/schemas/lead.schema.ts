import { z } from 'zod';

export const createLeadSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  mobileNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Mobile number must be a valid 10-digit number'),
  grossWeightGrams: z.number().positive('Gross weight must be positive'),
  netWeightGrams: z.number().positive('Net weight must be positive'),
  purityKarat: z.literal([18, 22, 24], {
    error: 'Purity karat must be 18, 22, or 24',
  }),
  selectedPlanId: z.uuid('Selected plan ID must be a valid UUID'),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
