import { prisma } from '../lib/prisma';
import type { LeadModel } from '../prisma/generated/models';
import type { CreateLeadRecord, LeadWithPlan } from '../types/lead.types';

// READS
export async function getLeads(): Promise<LeadWithPlan[]> {
  return prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    include: { selectedPlan: true },
  });
}

export async function getRecentLeadByMobileNumber(
  mobileNumber: string,
  since: Date,
): Promise<LeadModel | null> {
  return prisma.lead.findFirst({
    where: { mobileNumber, createdAt: { gte: since }, deletedAt: null },
  });
}

// WRITES
export async function createLead(input: CreateLeadRecord): Promise<LeadModel> {
  return prisma.lead.create({ data: input });
}
