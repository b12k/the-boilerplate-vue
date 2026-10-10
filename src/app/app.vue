<script lang="ts" setup>
  import { LayoutHollyGrail } from '@app/components';
  import { useStore } from '@app/store';
  import { useHead } from '@unhead/vue';

  const contextStore = useStore('context');

  useHead({
    htmlAttrs: {
      lang: () => contextStore.lang?.toString(),
    },
    link: [
      {
        href: 'https://fonts.googleapis.com',
        rel: 'preconnect',
      },
      {
        crossorigin: '',
        href: 'https://fonts.gstatic.com',
        rel: 'preconnect',
      },
      {
        href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;700&family=IBM+Plex+Sans:wght@400;700&family=IBM+Plex+Serif:wght@400;700&display=swap',
        rel: 'stylesheet',
      },
    ],
    title: 'App',
  });
</script>

<template>
  <LayoutHollyGrail>
    <RouterView v-slot="{ Component }">
      <Transition
        enter-active-class="animate__fadeIn"
        leave-active-class="animate__fadeOut"
        mode="out-in"
      >
        <component
          :is="Component"
          class="page animate__animated animate-fastest"
        />
      </Transition>
    </RouterView>
  </LayoutHollyGrail>
</template>
