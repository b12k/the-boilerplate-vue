# Connect an API

Set the full API address in `.env`:

```dotenv
API_URL=http://localhost:8080/api/mocks
```

The server copies this address to `context.apiUrl`. The browser and SSR use the same address. Choose a URL that both can reach. The server allows its origin in the page's CSP. An API on another origin must also allow browser requests through CORS.

## Configure once

[createApi](../src/app/services/api.service.ts) creates one Axios client per app instance. It builds the configuration from the context:

```ts
const apiClient = createAxios({
  baseURL: context.apiUrl,
  ...(ssrAbortSignal && { signal: ssrAbortSignal }),
});
```

Add typed methods to this service. Store actions call them without passing the SSR signal:

```ts
async fetchOverview() {
  this.overview = await this.$services.api.fetchOverview();
}
```

Keep shared response types in [api.types.ts](../src/app/services/api.types.ts). Replace the mock methods and store data with your API contracts.

## Cancel work automatically

The SSR signal cancels HTTP requests when the response budget expires or the client disconnects. An interceptor combines any explicit request signal with the SSR signal. It cannot disable SSR cancellation.

In the browser, the router sets a navigation signal as the Axios default. A new navigation cancels requests from the previous view, including manual requests. Failed navigation resets the default so the current view can make new requests. An explicit request signal replaces the browser default.

See the [showcase store](../src/app/store/stores/showcase.store.ts) for loading, errors, retry and cancellation states.

## Try the mock API

| Method | Path                             | Result                |
| ------ | -------------------------------- | --------------------- |
| GET    | `/api/mocks/overview`            | Features and projects |
| GET    | `/api/mocks/architecture`        | Layers and principles |
| GET    | `/api/mocks/projects/:projectId` | Project, or JSON 404  |
| GET    | `/api/mocks/run`                 | Result after 650 ms   |
| GET    | `/api/mocks/run?fail=true`       | Controlled JSON 500   |

Fixtures stay on the server. Responses use `Cache-Control: no-store`. A cancelled mock request clears its delay timer.
