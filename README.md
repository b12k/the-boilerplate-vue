# ⚡ The Boilerplate — Vue

<div align="center">
  <img src="./the-boilerplate-vue.png" alt="The Boilerplate VUE">
  <p>The last Vue boilerplate you ever need</p>
</div>

### Ship a serious Vue app before lunch. 🚀

The Boilerplate is a production-minded, server-rendered Vue foundation for
teams that want a fast start without giving up architecture, performance, or a
clean developer experience.

It combines Vue, Express, Rspack, Pinia, Nunjucks, Redis, critical CSS, and a
fully wired development toolchain into one focused stack. Clone it, replace
the demo pages, and start building the product that matters.

## ✨ Why it feels fast

- 🚀 **SSR first** — send meaningful HTML immediately, then hydrate into a
  full Vue application.
- ⚙️ **Dual Rspack pipeline** — optimized browser assets and a dedicated SSR
  renderer are built together.
- 🔥 **Excellent dev loop** — HMR, lazy compilation, live reload, Nodemon, and
  public-asset watching work as one workflow.
- 🧠 **Smart caching** — optional Redis for shared deployments, automatic LRU
  fallback for local development, and separate render/CSS caches.
- 🎨 **Critical CSS extraction** — PurgeCSS-powered above-the-fold styling is
  generated from the rendered page.
- 🛡️ **Server foundations included** — request IDs, structured logging,
  compression, Helmet, language routing, health checks, and error pages.
- 🧩 **Composable application layer** — route prefetching, Pinia stores,
  service injection, layouts, and reusable Vue components are already wired.
- 📦 **Container ready** — multi-stage Docker builds, Render configuration,
  production assets, and a clean `pnpm start` entrypoint.
- ✅ **Strict by default** — TypeScript, Oxlint, Oxfmt, Stylelint, Knip,
  Commitlint, Husky, and staged-file automation keep the codebase sharp.

## 🏗️ Architecture

```text
                           ┌──────────────────────┐
                           │      Browser 🌐       │
                           │  HTML + Vue hydrate   │
                           └──────────┬───────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────┐
│ Express server · src/server                                  │
│                                                              │
│ request ID → cookies → compression → security → language    │
│                         → request context → SSR              │
└───────────────┬─────────────────────────────┬────────────────┘
                │                             │
                ▼                             ▼
       ┌────────────────┐             ┌──────────────────┐
       │ Cache layer 🧠  │             │ Vue SSR renderer │
       │ Redis / LRU     │             │ src/app/server   │
       └────────┬───────┘             └────────┬─────────┘
                │                              │
                └──────────────┬───────────────┘
                               ▼
                 ┌──────────────────────────┐
                 │ Nunjucks document shell  │
                 │ HTML + head + state      │
                 │ + critical CSS            │
                 └──────────────────────────┘
```

### The runtime split

| Layer             | Location           | Role                                                                      |
| ----------------- | ------------------ | ------------------------------------------------------------------------- |
| 🎨 Vue app        | `src/app`          | Pages, routes, components, stores, services, and browser entrypoint       |
| 🖥️ Server         | `src/server`       | Express, middleware, SSR orchestration, cache, views, and health endpoint |
| 🧰 Build system   | `rspack`           | Browser bundle, SSR bundle, manifests, CSS extraction, and code splitting |
| 📄 Document shell | `src/server/views` | Nunjucks HTML template that injects rendered markup and hydrated state    |
| 📦 Static assets  | `src/public`       | Favicon and public files copied into the production output                |

## 🔁 Request lifecycle

1. Express assigns a request ID and applies the server middleware stack.
2. Language middleware selects or redirects to a supported language.
3. `AsyncLocalStorage` creates a request-scoped context with URL, device,
   language, cache flags, version, and request metadata.
4. SSR checks the render cache when enabled.
5. The Vue app is created with memory history, Pinia, services, and Unhead.
6. Route data prefetches run before server rendering.
7. Vue renders HTML and serialized Pinia state.
8. Critical CSS is loaded or generated from the rendered page.
9. Nunjucks assembles the final document and the browser hydrates it.

The result is a fast first paint with a real Vue application waiting behind it.

## 🧰 Stack at a glance

| Category    | Technology                                          |
| ----------- | --------------------------------------------------- |
| UI          | Vue 3, Vue Router, Pinia                            |
| Rendering   | Vue SSR, Express 5, Nunjucks                        |
| Bundling    | Rspack, SWC, Vue Loader                             |
| Styling     | Tailwind CSS 4, PostCSS                             |
| Performance | Redis, `lru-cache`, PurgeCSS, compression           |
| Operations  | Pino, Pino HTTP, Helmet, health endpoint            |
| Quality     | TypeScript, Vue TSC, Oxlint, Oxfmt, Stylelint, Knip |
| Delivery    | Docker, Docker Compose, Render blueprint            |

## 🚀 Quick start

### Requirements

- Node.js 26 — see `.nvmrc`
- pnpm 12.6.0 — see `package.json`
- Docker is optional and only needed for local Redis or container builds

```sh
pnpm install
pnpm dev
```

Then open **[http://localhost:8080](http://localhost:8080)**.

The first install prepares `.env` from `.env.example`. The default local
topology is:

| Process           |   Port | What it does                                 |
| ----------------- | -----: | -------------------------------------------- |
| Express + Nodemon | `8080` | Serves SSR pages and the application runtime |
| Rspack dev server | `8081` | Compiles browser assets, HMR, and manifests  |
| SWC watcher       |      — | Copies public assets into `dist/public`      |
| Redis, optional   | `6379` | Shared render and critical-CSS cache         |

### Optional Redis power-up 🧠

```sh
pnpm dev:docker-compose
pnpm dev
```

Redis is optional. If it is unavailable, the server automatically falls back
to an in-process LRU cache, making local development painless while still
supporting shared cache infrastructure in production.

Stop Redis with:

```sh
pnpm docker:down
```

## 🗺️ Routing and languages

- `/health` — lightweight JSON health response.
- `/public/*` — built static assets.
- `/` — redirects to the best language.
- `/{language}/*` — Vue SSR entrypoint.
- `/{language}/about` — sample page.
- `/{language}/404` — Vue 404 page with a 404 response code.

Language selection follows this order:

```text
URL language → lang cookie → Accept-Language → DEFAULT_LANGUAGE
```

Supported languages come from `ACCEPTED_LANGUAGES`, for example `de,en`.

Add routes in `src/app/router/routes.ts`. The router is designed for route
components that can expose async data prefetching, so the same page data model
can work during SSR and client-side navigation.

## 📁 Project map

```text
src/
├── app/
│   ├── assets/              icons and images
│   ├── components/          base components and layouts
│   ├── pages/               route-level Vue pages
│   ├── router/              routes and prefetch orchestration
│   ├── services/            app service layer
│   ├── store/               Pinia stores
│   ├── app.vue              root application shell
│   ├── browser.entry.ts     browser bootstrap
│   └── server.entry.ts      SSR renderer
├── public/                  files copied as-is
└── server/
    ├── middleware/          request pipeline and SSR
    ├── services/            cache, logging, context, CSS, assets
    ├── views/               Nunjucks document and error shells
    └── server.ts            Express entrypoint

rspack/                      browser/SSR build configuration
dist/                        generated output; safe to delete and rebuild
```

## 📜 Commands

| Command                   | Description                                                   |
| ------------------------- | ------------------------------------------------------------- |
| `pnpm dev`                | Run the complete development stack.                           |
| `pnpm build`              | Clean and build browser, SSR, public, and server artifacts.   |
| `pnpm start`              | Start the built production server.                            |
| `pnpm start:local`        | Rebuild and run the production-mode server locally.           |
| `pnpm check`              | Run formatting, linting, style, type, and unused-code checks. |
| `pnpm fix`                | Apply formatting, lint, and style fixes.                      |
| `pnpm stats`              | Generate and serve bundle statistics.                         |
| `pnpm dev:docker-compose` | Start the local Redis service.                                |
| `pnpm docker:down`        | Stop local Docker services.                                   |
| `pnpm docker:build:amd`   | Build and push an amd64 image.                                |
| `pnpm docker:build:arm`   | Build and push an arm64 image.                                |

## ⚡ Performance architecture

The server has two cache lanes:

- **Render cache** — stores SSR output, route metadata, head tags, and Pinia
  state.
- **Critical CSS cache** — stores PurgeCSS output generated from the rendered
  HTML and emitted CSS assets.

Redis provides a shared cache for multiple instances. Without Redis, each
process uses a bounded LRU cache. Cache namespaces default to the package
version, so a release can naturally invalidate incompatible cached output.

The sample cache policy keys the demo render by language and device. When you
add authentication, personalization, tenants, experiments, or query-driven
content, update `src/server/idempotency.config.ts` so every render-affecting
input is represented in the key.

## 🎨 Frontend workflow

The browser compiler produces:

- hashed JavaScript in `dist/public/js`
- extracted CSS in `dist/public/css`
- a browser asset manifest at `dist/public/manifest.json`
- lazy chunks for route-level code splitting

The SSR compiler produces:

- `dist/ssr/index.cjs`
- lazy SSR chunks under `dist/ssr`
- `dist/ssr/manifest.json`

Development writes browser assets to disk so the Express server can consume
the same manifest and renderer shape used by production. That keeps the local
path close to the deployed path while preserving HMR speed.

## 🐳 Production and deployment

Build and run locally:

```sh
pnpm build
pnpm start
```

Build a container:

```sh
pnpm docker:build:amd
# or
pnpm docker:build:arm
```

The Dockerfile uses a multi-stage Node 26 Alpine build: dependencies are
installed once, the app is compiled in a builder image, and the runner receives
only production dependencies plus `dist`.

`render.yaml` provides a starting point for a web service and Redis service.
Supply the server environment through the platform, including `PORT`,
`NODE_ENV`, `DEFAULT_LANGUAGE`, `ACCEPTED_LANGUAGES`, and the
debug/cache settings appropriate for your deployment.

## 🔐 Production launch checklist

Before launch, make the template yours:

- Set `IS_DEBUG_ON=false` or remove it.
- Protect or remove request-triggered debug tooling.
- Configure `ACCEPTED_LANGUAGES` and `DEFAULT_LANGUAGE`.
- Review render-cache keys for every personalized page.
- Set Redis networking and credentials for your platform.
- Replace the sample Umami ID, fonts, and external CSP origins.
- Run `pnpm check && pnpm build` in CI.
- Add request-level tests for SSR, hydration, redirects, and caching.

## 🌟 Start building

The boring infrastructure is already connected. The fun part is yours:

```text
clone → install → pnpm dev → replace the demo → ship 🚢
```

MIT licensed.
