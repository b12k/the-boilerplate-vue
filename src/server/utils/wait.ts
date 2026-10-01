import { setTimeout } from 'node:timers/promises';

function wait(ms: number) {
  return setTimeout(ms);
}

export { wait };
