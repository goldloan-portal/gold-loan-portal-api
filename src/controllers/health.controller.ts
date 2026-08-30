import type { Request, Response } from 'express';

// READS
export function getHealth(_req: Request, res: Response): void {
  res.json({ data: { status: 'ok' } });
}
