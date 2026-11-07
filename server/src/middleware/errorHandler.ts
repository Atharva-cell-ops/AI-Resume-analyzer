import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiResponse } from '@ai-resume/shared';

export class AppError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode = 400, code = 'BAD_REQUEST') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  // Handle Zod validation errors
  if (err instanceof ZodError || err.name === 'ZodError' || 'issues' in err) {
    const zodErr = err as ZodError;
    const formattedErrors = (zodErr.errors || zodErr.issues || []).map(e => ({
      field: e.path ? e.path.join('.') : '',
      message: e.message
    }));

    const detailMsg = formattedErrors.map(e => `${e.field ? e.field + ': ' : ''}${e.message}`).join(', ');

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: detailMsg || 'Invalid input payload provided',
        details: formattedErrors
      }
    };
    res.status(400).json(response);
    return;
  }

  // Handle known application errors
  if (err instanceof AppError) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message
      }
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // Handle unexpected server errors
  console.error('[UNHANDLED ERROR]:', err);
  const response: ApiResponse = {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred'
    }
  };
  res.status(500).json(response);
}

