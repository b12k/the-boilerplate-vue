# Run the server

## Set the environment

These variables are required in every mode:

| Variable             | Purpose                                                                  |
| -------------------- | ------------------------------------------------------------------------ |
| `ACCEPTED_LANGUAGES` | Comma-separated two-letter language codes                                |
| `DEFAULT_LANGUAGE`   | One of the accepted languages                                            |
| `API_URL`            | Full HTTP or HTTPS API address, reachable by SSR and the browser         |
| `REDIS_HOST`         | Redis hostname                                                           |
| `REDIS_PORT`         | Redis port                                                               |
| `REDIS_PASSWORD`     | Password for the Redis default user; empty if authentication is disabled |

Use Redis 8.4 or later. The cache uses [conditional SET](https://redis.io/docs/latest/commands/set/) and [DELEX](https://redis.io/docs/latest/commands/delex/). Compose supplies a compatible version.

[env-defaults.ts](../src/server/env/env-defaults.ts) is the source of server defaults. [.env.example](../.env.example) contains local settings and commented override examples. Set `WDS_PORT` for development. The default application port is 8080.

## Choose a run mode

| Command            | Behavior                                                       |
| ------------------ | -------------------------------------------------------------- |
| `pnpm dev`         | Development builds, file watching and browser updates          |
| `pnpm start:local` | Production build with local `.env`, rebuilt on file changes    |
| `pnpm build`       | Browser, server and public files in `dist`                     |
| `pnpm start`       | Run `dist/server/server.js` with process environment variables |

`pnpm start` does not load `.env`. Without `NODE_ENV`, server settings default to production. Stop one mode before you start another on the same port.

SSR routes accept GET, with Express handling HEAD automatically. Other methods return 405.

Build the production container with:

```sh
docker build -t the-boilerplate-vue .
```

Configure the required variables in your hosting platform. The image runs Node as a non-root user. Root Compose commands start Redis only. `pnpm docker:down` stops that local service.

## Cache public pages

The default render rule in [idempotency.config.ts](../src/server/idempotency.config.ts) covers the home route, grouped by language and device type. The matcher uses the pathname. Query parameters remain in the context but do not add default cache keys.

Cache a page only when its HTML and store data are the same for that key. Extend the rules when data depends on more inputs. Each production release must have a new `package.json` version: it supplies the salt for both cache namespaces. Development uses a startup timestamp.

Render and critical CSS entries expire after one day by default. A pending entry prevents duplicate cache publication. Requests that find pending run their own SSR immediately. They do not wait for another render.

Pending TTL is the calculation budget plus 1000 ms: 31000 ms for render and 11000 ms for CSS with default settings.

SSR HTML responses include `X-Cache-Render-Status` and `X-Cache-Critical-Css-Status`:

- `HIT`: the response uses the cached render or critical CSS. The matching `X-Cache-Render` or `X-Cache-Critical-Css` header contains its key.
- `MISS`: the cache has a key, but no cached result was used. This includes pending entries and unavailable Redis. A render refresh also returns `MISS`.
- `BYPASS`: the route has no render cache rule.
- `OFF`: that cache is explicitly disabled. Its matching `X-Cache-Render` or `X-Cache-Critical-Css` header contains `off`.

Each status describes the current response. It does not confirm a later cache write. Critical CSS refresh can return `HIT` when the response uses the previous CSS while a background job updates it.

Redis settings remain required when caches are disabled. An unavailable Redis produces cache misses and SSR continues. Reads wait at most `REDIS_READ_TIMEOUT_MS`, default 1000 ms per read. Cache mutations have a 1000 ms wait limit. A timeout ends local waiting; a command already sent to Redis may still finish.

`REDIS_CONNECTION_RETRIES` defaults to 5. After retries are exhausted, the process stays in SSR mode without further reconnect attempts until restart.

## Generate critical CSS

PurgeCSS runs in a Piscina thread pool. It removes unused CSS based on rendered HTML. The first response uses full CSS while a background job computes critical CSS for later requests. Keys use the route name, or its path when unnamed. Full page CSS always remains available.

Defaults: one worker, eight queued jobs, 1 MiB maximum HTML and a 10000 ms calculation budget. A full queue or a failed job skips the optimization. Configure these limits through the `CACHE_CRITICAL_CSS_*` overrides.

## Observe and release

`GET /health` returns `ready`, `status`, `uptime` in milliseconds and the application `version`. It returns 200 when ready and 503 while draining. It does not require Redis to be ready.

Visible browser tabs check this version every 60 seconds. A version change reloads the page. Hidden tabs pause checks and check again when visible. An open tab can still request an old chunk before its next check.

SSR has a 30000 ms response budget. Expiry returns HTTP 500 and aborts SSR API work. Client disconnection also aborts that work. `SIGTERM` and `SIGINT` stop new traffic, wait for active work and close the CSS pool and Redis. Allow more than `SHUTDOWN_BUDGET_MS` in your hosting stop grace period; the default is 30000 ms.

HTML, health and error responses use `no-store`. Production assets with content hashes use a one-year immutable cache. Redis TTL does not control browser caching.

Helmet sets security headers. HTML responses have a CSP and a fresh nonce, including responses built from cached renders.

Each response includes `X-Request-ID`. The server accepts a client ID or generates one. It is logged and stays outside cached state.

## Diagnose a request

Development enables HTML diagnostics. In production, set `DEBUG_ON_KEY` to a UUID and send the same value in a `DEBUG_ON_KEY` header, query parameter or cookie. Omit the variable to disable this access. An empty configured key is invalid.

Diagnostic HTML includes full environment values. Treat the key and response as credentials. The logger masks configured secrets. Source maps are disabled by default. See the [environment schema](../src/server/env/env-schema.ts) for accepted settings.

Before production, measure latency, CPU and memory with your pages and API. Include cold caches and Redis failure. The engineering smoke checks confirm behavior; they do not establish a traffic capacity.
