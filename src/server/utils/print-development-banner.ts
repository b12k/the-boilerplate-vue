import { stdout } from 'node:process';

function printDevelopmentBanner(PORT: number) {
  stdout.write(`
***********************************************
*                                             *
* 🚀 Server running on: http://localhost:${PORT} *
*                                             *
***********************************************
`);
}

export { printDevelopmentBanner };
