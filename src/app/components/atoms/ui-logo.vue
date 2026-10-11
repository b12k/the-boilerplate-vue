<script setup lang="ts">
  import { tv } from 'tailwind-variants';

  const { size = 'regular' } = defineProps<{ size?: 'regular' | 'small' }>();
  const logo = tv({
    base: 'block h-auto rounded bg-black p-2',
    defaultVariants: { size: 'regular' },
    variants: { size: { regular: 'w-44 md:w-52', small: 'w-32' } },
  });
</script>

<template>
  <img
    src="/public/the-boilerplate-vue.png"
    alt="The Boilerplate Vue"
    width="1024"
    height="225"
    :class="logo({ size })"
  />
</template>
