import type { AcceptedPlugin } from 'postcss';

import tailwindcss from '@tailwindcss/postcss';

export default {
  plugins: [tailwindcss()],
} satisfies { plugins: Array<AcceptedPlugin> };
