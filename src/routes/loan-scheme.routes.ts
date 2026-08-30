import { Router } from 'express';

import { getLoanSchemes } from '../controllers/loan-scheme.controller';

const router: Router = Router();

// READS
router.get('/', getLoanSchemes);

export default router;
