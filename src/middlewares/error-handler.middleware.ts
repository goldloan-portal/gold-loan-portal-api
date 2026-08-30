import type { NextFunction, Request, Response } from 'express';

import { AppError } from '../lib/app-error';
import { ValidationError } from '../lib/errors/validation.error';
import { Prisma } from '../prisma/generated/client';

const PRISMA_ERROR_STATUS_CODES: Record<string, number> = {
  P2002: 409,
  P2025: 404,
  P2003: 400,
};

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error(err);

  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({
      error: {
        code: err.name,
        message: err.message,
        details: err.fieldErrors,
      },
    });
    return;
  }

  if (err instanceof AppError) {
    res
      .status(err.statusCode)
      .json({ error: { code: err.name, message: err.message } });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const statusCode = PRISMA_ERROR_STATUS_CODES[err.code] ?? 500;
    res
      .status(statusCode)
      .json({ error: { code: err.code, message: 'Database request failed' } });
    return;
  }

  res.status(500).json({
    error: { code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong' },
  });
}
