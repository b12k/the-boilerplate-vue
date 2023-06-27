import helmet from 'helmet';

export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      'script-src': ['self', 'unsafe-inline'],
      'image-src': ['self', 'data:'],
    },
  },
});
