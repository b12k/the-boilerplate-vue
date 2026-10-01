import type { Request } from 'express';

function createRequestPropertyExtractor(request: Request) {
  return (property: string, defaultValue = '') => {
    const { cookies } = request;
    const { headers, query } = request;
    const cookie: unknown = cookies[property];
    const candidates: Array<unknown> = [
      cookie,
      headers[property],
      query[property],
    ];
    return (
      candidates.find(
        (candidate): candidate is string =>
          typeof candidate === 'string' && candidate.length > 0,
      ) ?? defaultValue
    );
  };
}

export { createRequestPropertyExtractor };
