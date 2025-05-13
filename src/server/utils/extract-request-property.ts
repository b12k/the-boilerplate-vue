import { type Request } from 'express';

export const createRequestPropertyExtractor =
  (request: Request) =>
  (property: string, defaultValue = '') => {
    const { cookies } = request;
    const { headers, query } = request;
    return (cookies[property] ||
      headers[property] ||
      query[property] ||
      defaultValue) as string;
  };
