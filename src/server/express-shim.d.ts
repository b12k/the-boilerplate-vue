declare global {
  namespace Express {
    interface Request {
      // Set by loggerService before request handlers run.
      requestId: string;
    }
  }
}

export type { Request } from 'express';
