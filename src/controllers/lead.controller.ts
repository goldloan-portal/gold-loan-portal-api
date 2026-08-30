import type { Request, Response } from 'express';

import type { CreateLeadInput } from '../schemas/lead.schema';
import * as leadService from '../services/lead.service';
import { maskMobileNumber } from '../services/lead.util';
import type {
  CreateLeadResponse,
  LeadResponse,
  LeadWithPlan,
} from '../types/lead.types';

// READS
export async function getLeads(_req: Request, res: Response): Promise<void> {
  const leads = await leadService.getLeads();
  res.json({ data: leads.map(toLeadResponse) });
}

// WRITES
export async function createLead(req: Request, res: Response): Promise<void> {
  const input = req.body as CreateLeadInput;
  const lead = await leadService.createLead(input);
  const response: CreateLeadResponse = { applicationId: lead.id };
  res.status(201).json({ data: response });
}

// HELPERS
function toLeadResponse(lead: LeadWithPlan): LeadResponse {
  return {
    id: lead.id,
    customerName: lead.customerName,
    mobileNumber: maskMobileNumber(lead.mobileNumber),
    netWeightGrams: lead.netWeightGrams.toNumber(),
    status: lead.status,
    maxEligibleLoan: lead.maxEligibleLoan.toNumber(),
    plan: { id: lead.selectedPlan.id, name: lead.selectedPlan.name },
    createdAt: lead.createdAt,
  };
}
