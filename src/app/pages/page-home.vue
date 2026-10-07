<script setup lang="ts">
  import { BaseIcon } from '@app/components/base';
  import { useStore } from '@app/store';
  import { useHead } from '@unhead/vue';
  import { storeToRefs } from 'pinia';

  defineOptions({
    fetchData: async (_, getStore, signal) => {
      await getStore('showcase').fetchOverview(signal);
    },
  });
  const { overview } = storeToRefs(useStore('showcase'));
  const homeStore = useStore('home');
  const { counter, doubledCounter } = storeToRefs(homeStore);
  useHead({ title: 'Vue Boilerplate — A clear starting point' });
</script>

<template>
  <main class="page-home page-shell">
    <section class="hero">
      <div>
        <span class="eyebrow">
          <span class="status-dot" />
          A SMALL FOUNDATION. A FULL APPLICATION.
        </span>
        <h1>
          Build the app.
          <br />
          <span class="muted">Own the architecture.</span>
        </h1>
        <p class="hero-description">
          Vue, TypeScript and server rendering. Clear layers, shared state, and
          a request path you can understand.
        </p>
        <div class="button-row">
          <RouterLink
            class="button button-primary"
            to="/lab"
          >
            Explore the data flow
            <span aria-hidden="true">↗</span>
          </RouterLink>
          <RouterLink
            class="button button-secondary"
            to="/about"
          >
            See the architecture
          </RouterLink>
        </div>
        <div class="tech-strip">
          <span>Vue</span>
          <span>TypeScript</span>
          <span>Pinia</span>
          <span>Rspack</span>
          <span>Express</span>
        </div>
      </div>
      <div class="flow-panel">
        <div class="panel-heading">
          <span class="eyebrow">THE REQUEST PATH</span>
          <span class="tag">SSR → CLIENT</span>
        </div>
        <div class="flow-row">
          <span class="flow-number">01</span>
          <div>
            <strong>Request arrives</strong>
            <small>Route + language + device context</small>
          </div>
          <span class="flow-check">✓</span>
        </div>
        <div class="flow-row">
          <span class="flow-number">02</span>
          <div>
            <strong>Fetch the data</strong>
            <small>Typed API → scoped Pinia store</small>
          </div>
          <span class="flow-check">✓</span>
        </div>
        <div class="flow-row">
          <span class="flow-number">03</span>
          <div>
            <strong>Render useful HTML</strong>
            <small>Page content + serialized state</small>
          </div>
          <span class="flow-check">✓</span>
        </div>
        <div class="flow-row">
          <span class="flow-number">04</span>
          <div>
            <strong>Let the client take over</strong>
            <small>Hydrate once. Navigate without reload.</small>
          </div>
          <span class="flow-check">✓</span>
        </div>
        <div class="panel-note">
          <span class="status-dot" />
          Mock data. Real application lifecycle.
        </div>
      </div>
    </section>
    <section class="section-block">
      <div class="section-heading">
        <div>
          <span class="eyebrow">BUILT INTO THE FOUNDATION</span>
          <h2>Small pieces. A complete path.</h2>
        </div>
        <span class="section-index">01 / CAPABILITIES</span>
      </div>
      <div class="feature-grid">
        <article
          v-for="feature in overview?.features"
          :key="feature.name"
          class="feature-card"
        >
          <span class="card-number">{{ feature.number }}</span>
          <h3>{{ feature.name }}</h3>
          <p>{{ feature.description }}</p>
        </article>
      </div>
    </section>
    <section class="section-block">
      <div class="section-heading">
        <div>
          <span class="eyebrow">DATA FROM THE MOCK API</span>
          <h2>One foundation. Different products.</h2>
        </div>
        <span class="tag">PREFETCHED INTO PINIA</span>
      </div>
      <div class="project-grid">
        <RouterLink
          v-for="project in overview?.projects"
          :key="project.id"
          :to="'/projects/' + project.id"
          class="project-card"
        >
          <div class="project-mark">
            {{ project.name.slice(0, 1) }}
            <span aria-hidden="true">↗</span>
          </div>
          <span class="eyebrow">{{ project.category }}</span>
          <h3>{{ project.name }}</h3>
          <p>{{ project.description }}</p>
          <span class="project-status">
            <span class="status-dot" />
            {{ project.status }}
          </span>
        </RouterLink>
      </div>
    </section>
    <section class="state-panel">
      <div>
        <span class="eyebrow">A STORE YOU CAN TOUCH</span>
        <h2>State stays with you.</h2>
        <p>
          Change the counter. Visit another page. Come back.
          <br />
          The same Pinia store keeps your value during navigation.
        </p>
      </div>
      <div class="counter-demo">
        <BaseIcon
          icon="ShakaBrah"
          class="demo-icon"
          aria-hidden="true"
        />
        <div class="counter-values">
          <strong>{{ counter }}</strong>
          <span>× 2</span>
          <strong>{{ doubledCounter }}</strong>
        </div>
        <button
          class="button button-primary"
          type="button"
          @click="homeStore.incrementCounter()"
        >
          Increment counter
          <span aria-hidden="true">+</span>
        </button>
        <small>A full reload restores the server state.</small>
      </div>
    </section>
  </main>
</template>
