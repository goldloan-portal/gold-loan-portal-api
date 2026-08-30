import type { Request, Response } from 'express';

import type { CreateLeadInput } from '../schemas/lead.schema';
import * as leadService from '../services/lead.service';
import type { CreateLeadResponse } from '../types/lead.types';

// WRITES
export async function createLead(req: Request, res: Response): Promise<void> {
  const input = req.body as CreateLeadInput;
  const lead = await leadService.createLead(input);
  const response: CreateLeadResponse = { applicationId: lead.id };
  res.status(201).json({ data: response });
}
