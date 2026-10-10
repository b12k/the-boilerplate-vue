# API service

Set the full API address in `.env`:

```dotenv
API_URL=http://localhost:8080/api/mocks
```

The server copies this address to `context.apiUrl`. The browser and SSR use the same address. Choose a URL that both can reach. The server allows its origin in the page's CSP. An API on another origin must also allow browser requests through CORS.

Each app instance has its own Axios client. `createApi` builds its configuration from the context. `createServices(context, logger, ssrAbortSignal?)` passes these inputs to each service factory.

```ts
const apiClient = createAxios({
  baseURL: context.apiUrl,
  ...(ssrAbortSignal && { signal: ssrAbortSignal }),
});
```

Stores call the service without passing a signal:

```ts
async fetchOverview() {
  this.overview = await this.$services.api.fetchOverview();
}
```

The SSR signal cancels HTTP requests when the response budget expires or the browser disconnects. It stays outside the context and Pinia state.

In the browser, the router sets a navigation signal on Axios. Starting another navigation cancels requests from the previous view, including manual requests. Failed navigation resets the default signal so the current view can make new requests.

A service method can accept an extra signal for a specific request. The request interceptor combines it with the SSR signal. An extra signal cannot disable SSR cancellation.

The demo uses real HTTP endpoints:

| Method | Path                             | Result                |
| ------ | -------------------------------- | --------------------- |
| GET    | `/api/mocks/overview`            | Features and projects |
| GET    | `/api/mocks/architecture`        | Layers and principles |
| GET    | `/api/mocks/projects/:projectId` | Project, or JSON 404  |
| GET    | `/api/mocks/run`                 | Result after 650 ms   |
| GET    | `/api/mocks/run?fail=true`       | Controlled JSON 500   |

Fixtures stay on the server. Shared TypeScript contracts are exported from `@app/services`. The API sends `Cache-Control: no-store`. A cancelled mock request clears its delay timer.
