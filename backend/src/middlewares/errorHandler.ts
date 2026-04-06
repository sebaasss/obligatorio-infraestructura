import { Request, Response, NextFunction } from 'express';

interface AppError {
  status?: number;
  message?: string;
}

export function errorHandler(
  err: AppError | Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status = (err as AppError).status || 500;
  const message = err.message || 'Internal server error';

  if (status >= 500) {
    console.error('[ERROR]', err);
  }

  res.status(status).json({ error: message });
}
