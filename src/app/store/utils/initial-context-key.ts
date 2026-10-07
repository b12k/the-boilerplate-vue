import type { Context } from '@server/services';
import type { InjectionKey } from 'vue';

export const initialContextKey: InjectionKey<Context> =
  Symbol('initialContext');
