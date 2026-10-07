import { tv } from 'tailwind-variants';

const action = tv({
  base: 'inline-flex items-center justify-center gap-5 rounded-md border px-4.5 py-3 text-sm font-medium transition-colors motion-reduce:transition-none',
  defaultVariants: { appearance: 'secondary' },
  variants: {
    appearance: {
      primary: 'border-transparent bg-accent text-white hover:bg-accent-dark',
      secondary: 'border-line hover:bg-panel',
      text: 'gap-3.5 rounded-none border-transparent p-0 text-accent hover:underline',
    },
  },
});

const container = tv({
  base: 'mx-auto w-[calc(100%-2.25rem)] max-w-295 md:w-[calc(100%-5rem)]',
});

export { action, container };
