import { Router } from 'express';

import { createLead, getLeads } from '../controllers/lead.controller';
import { validate } from '../middlewares/validate.middleware';
import { createLeadSchema } from '../schemas/lead.schema';

const router: Router = Router();

// READS
router.get('/', getLeads);

// WRITES
router.post('/submit', validate(createLeadSchema), createLead);

export default router;
