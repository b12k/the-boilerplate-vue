<img src="src/public/the-boilerplate-vue.png" alt="The Boilerplate Vue" width="96" />

# The Boilerplate Vue

**Vue. TypeScript. Server rendering. A clear starting point.**

Build an app with code you can follow. This starter connects Vue, Pinia and Vue Router to an Express server. Rspack builds the browser and server bundles. The demo shows the full path from an HTTP request to client navigation.

## Built into the foundation

| Feature                | What it gives you                                     |
| ---------------------- | ----------------------------------------------------- |
| SSR and route prefetch | Useful HTML and data before browser code runs         |
| Pinia hydration        | The browser starts with the server's state            |
| Request isolation      | Each SSR request has its own app, stores and services |
| Axios service          | One API address and automatic SSR cancellation        |
| Redis caches           | Reuse public page renders and critical CSS            |
| Critical CSS workers   | Run CSS analysis in a bounded Piscina pool            |
| Page assets            | Load the CSS and scripts needed for the rendered page |
| Unhead                 | Manage page titles, metadata and document language    |
| Tailwind and variants  | Build shared UI from small components                 |
| Server lifecycle       | Response budgets, health checks and graceful shutdown |

## Start in minutes

Use the Node.js version in [.nvmrc](.nvmrc) and Docker with Compose. Install [Corepack](https://github.com/nodejs/corepack#manual-installs) if it is missing. Corepack selects the pnpm version from [package.json](package.json).

Clone this repository, then run these commands from its root:

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm docker:up
pnpm dev
```

Installation creates `.env` from [.env.example](.env.example) when the file is absent. Compose starts the local Redis service. Open [localhost:8080](http://localhost:8080).

If Redis port 6379 is in use, change `REDIS_PORT` in `.env` before you start Compose. Stop the development server before you use another run mode.

## Explore the demo

- **Overview** — SSR data, shared state and example projects.
- **Architecture** — application layers and the request flow.
- **Data Lab** — loading, success, failure, retry and cancellation.
- **Project pages** — route parameters and repeated prefetch.

The demo uses real HTTP calls to a local mock API. It is a working example you can replace with your own app.

## Build with confidence

```sh
pnpm check        # Types, code, styles, formatting and unused code
pnpm start:local  # Build and run production locally with .env
pnpm build        # Create dist for deployment
```

The browser build targets `esnext`. This starter supports current browsers.

## Make it yours

[Build pages](docs/app.md) · [Connect an API](docs/api.md) · [Run the server](docs/server.md)

Keep the design simple. Share repeated code. Add a new layer when the app needs it.
