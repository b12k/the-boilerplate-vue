import type { Context } from '@server/services';
import type { InjectionKey } from 'vue';

const initialContextKey: InjectionKey<Context> = Symbol('initialContext');

export { initialContextKey };
