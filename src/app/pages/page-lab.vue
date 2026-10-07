<script setup lang="ts">
  import { useStore } from '@app/store';
  import { useHead } from '@unhead/vue';
  import { storeToRefs } from 'pinia';
  import { onScopeDispose } from 'vue';

  defineOptions({
    fetchData: async (_, getStore, signal) => {
      await getStore('showcase').fetchRun(false, signal);
    },
  });
  const showcaseStore = useStore('showcase');
  const { isRunPending, requestsCount, run, runError } =
    storeToRefs(showcaseStore);
  const { counter, doubledCounter } = storeToRefs(useStore('home'));
  const {
    device,
    isCriticalCssCacheEnabled,
    isRenderCacheEnabled,
    lang,
    version,
  } = storeToRefs(useStore('context'));
  const controller = new AbortController();
  onScopeDispose(() => controller.abort());

  async function fetchRun(shouldFail = false) {
    await showcaseStore.fetchRun(shouldFail, controller.signal);
  }
  useHead({ title: 'Data Lab — Vue Boilerplate' });
</script>

<template>
  <main class="page-lab page-shell">
    <section class="page-intro">
      <span class="eyebrow">03 / INTERACTIVE DEMO</span>
      <h1>
        Watch the data
        <br />
        become a page.
      </h1>
      <p>
        A fake API with real asynchronous behaviour. The response lives in
        Pinia. The page reads it, on the server and in your browser.
      </p>
    </section>
    <div class="lab-grid">
      <section class="lab-console">
        <div class="panel-heading">
          <span class="eyebrow">REQUEST CONSOLE</span>
          <span class="tag">MOCK API</span>
        </div>
        <div class="console-endpoint">
          <span>GET</span>
          <code>/demo/run</code>
          <span class="mock-delay">650 ms simulated delay</span>
        </div>
        <div
          class="run-result"
          aria-live="polite"
          :aria-busy="isRunPending"
        >
          <template v-if="isRunPending">
            <span class="loading-ring" />
            <h2>Request in progress.</h2>
            <p>
              The route can show this state while prefetch runs in the
              background.
            </p>
          </template>
          <template v-else-if="runError">
            <span class="result-symbol error-symbol">!</span>
            <h2>A controlled failure.</h2>
            <p>{{ runError }}</p>
          </template>
          <template v-else-if="run">
            <span class="result-symbol">✓</span>
            <h2>Data is ready.</h2>
            <p>Response #{{ run.sequence }} is now in the store.</p>
            <ol class="run-steps">
              <li
                v-for="step in run.steps"
                :key="step"
              >
                <span aria-hidden="true">✓</span>
                {{ step }}
              </li>
            </ol>
          </template>
        </div>
        <div class="button-row">
          <button
            type="button"
            class="button button-primary"
            :disabled="isRunPending"
            @click="fetchRun()"
          >
            {{ runError ? 'Retry request' : 'Run request' }}
            <span aria-hidden="true">↗</span>
          </button>
          <button
            type="button"
            class="button button-secondary"
            :disabled="isRunPending"
            @click="fetchRun(true)"
          >
            Simulate failure
          </button>
        </div>
      </section>
      <aside class="context-panel">
        <span class="eyebrow">LIVE APPLICATION STATE</span>
        <h2>
          Same store.
          <br />
          Different view.
        </h2>
        <dl>
          <div>
            <dt>Completed mock calls</dt>
            <dd>{{ requestsCount }}</dd>
          </div>
          <div>
            <dt>Shared counter</dt>
            <dd>{{ counter }} → {{ doubledCounter }}</dd>
          </div>
          <div>
            <dt>Language</dt>
            <dd>{{ lang }}</dd>
          </div>
          <div>
            <dt>Device</dt>
            <dd>{{ device.type }}</dd>
          </div>
          <div>
            <dt>App version</dt>
            <dd>{{ version }}</dd>
          </div>
          <div>
            <dt>Render cache</dt>
            <dd>{{ isRenderCacheEnabled ? 'Enabled' : 'Disabled' }}</dd>
          </div>
          <div>
            <dt>Critical CSS cache</dt>
            <dd>{{ isCriticalCssCacheEnabled ? 'Enabled' : 'Disabled' }}</dd>
          </div>
        </dl>
        <p>
          Change the counter on Overview, then return here. Its value persists
          without a page reload.
        </p>
        <RouterLink
          class="text-link"
          to="/"
        >
          Back to Overview
          <span aria-hidden="true">↗</span>
        </RouterLink>
      </aside>
    </div>
    <section class="section-block">
      <div class="section-heading">
        <div>
          <span class="eyebrow">WHAT TO TRY</span>
          <h2>Three useful experiments.</h2>
        </div>
      </div>
      <div class="principle-grid">
        <article class="feature-card">
          <span class="card-number">01</span>
          <h3>Open this URL directly.</h3>
          <p>
            SSR waits for the route data. The first HTML already contains the
            completed result.
          </p>
        </article>
        <article class="feature-card">
          <span class="card-number">02</span>
          <h3>Navigate here from Overview.</h3>
          <p>
            This route uses noPreFetchAwait. Navigation can complete while the
            mock request is pending.
          </p>
        </article>
        <article class="feature-card">
          <span class="card-number">03</span>
          <h3>Leave while it loads.</h3>
          <p>
            The navigation signal cancels the mock delay. A stale result cannot
            replace the next request.
          </p>
        </article>
      </div>
    </section>
  </main>
</template>
