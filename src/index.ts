import cors from 'cors';
import 'dotenv/config';
import express from 'express';

import healthRoutes from './routes/health.routes';

const app = express();
const port = process.env.PORT ?? 4000;

app.use(cors());
app.use(express.json());

app.use('/api/v1/health', healthRoutes);

app.listen(port, () => {
  console.log(`gold-loan-portal-api listening on port ${port}`);
});
