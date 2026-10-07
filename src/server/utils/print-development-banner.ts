import { stdout } from 'node:process';

export function printDevelopmentBanner(PORT: number) {
  stdout.write(`
***********************************************
*                                             *
* 🚀 Server running on: http://localhost:${PORT} *
*                                             *
***********************************************
`);
}
