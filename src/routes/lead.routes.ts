import { Router } from 'express';

import { createLead } from '../controllers/lead.controller';
import { validate } from '../middlewares/validate.middleware';
import { createLeadSchema } from '../schemas/lead.schema';

const router: Router = Router();

// WRITES
router.post('/submit', validate(createLeadSchema), createLead);

export default router;
