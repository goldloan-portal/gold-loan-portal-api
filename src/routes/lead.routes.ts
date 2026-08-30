import { Router } from 'express';

import {
  calculateLead,
  createLead,
  getLeads,
} from '../controllers/lead.controller';
import { validate } from '../middlewares/validate.middleware';
import { calculateLeadSchema, createLeadSchema } from '../schemas/lead.schema';

const router: Router = Router();

// READS
router.get('/', getLeads);

// WRITES
router.post('/calculate', validate(calculateLeadSchema), calculateLead);
router.post('/submit', validate(createLeadSchema), createLead);

export default router;
