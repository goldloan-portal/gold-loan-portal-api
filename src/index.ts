import cors from 'cors';
import 'dotenv/config';
import express, { type Request, type Response } from 'express';

const app = express();
const port = process.env.PORT ?? 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`gold-loan-portal-api listening on port ${port}`);
});
