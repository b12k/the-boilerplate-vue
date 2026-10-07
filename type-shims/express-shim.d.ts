declare global {
  namespace Express {
    interface Request {
      nonce: string;
      // Set by loggerService before request handlers run.
      requestId: string;
    }
  }
}

export type { Request } from 'express';
