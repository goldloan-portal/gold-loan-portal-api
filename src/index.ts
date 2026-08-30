import cors from 'cors';
import 'dotenv/config';
import express from 'express';

import { errorHandler } from './middlewares/error-handler.middleware';
import healthRoutes from './routes/health.routes';
import loanSchemeRoutes from './routes/loan-scheme.routes';

const app = express();
const port = process.env.PORT ?? 4000;

app.use(cors());
app.use(express.json());

app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/loan-schemes', loanSchemeRoutes);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`gold-loan-portal-api listening on port ${port}`);
});
