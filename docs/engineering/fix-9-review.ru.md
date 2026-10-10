# Пункт 9: централизованная отмена SSR API

Базовый коммит: 2080a76. Проверено и подтверждено пользователем 10 октября 2026. Отчёт относится к отдельному коммиту пункта 9.

## Итоговое поведение

SSR middleware создаёт отдельный AbortController для каждого запроса. Сигнал передаётся renderer, createApp и createServices. Контракт фабрики сервисов: createServices(context, logger, ssrAbortSignal?). Каждая фабрика сама собирает конфигурацию; apiConfig и ssrApiOrigin отсутствуют.

API_URL — обязательный полный HTTP(S) адрес из .env. Context builder сохраняет его в context.apiUrl; createApi использует этот адрес как baseURL Axios. SSR и браузер используют один адрес. Origin разрешён в CSP. Для demo задан http://localhost:8080/api/mocks. При другой публикации адрес должен быть доступен и браузеру, и SSR; API на другом origin также должен настроить CORS.

Каждый экземпляр приложения создаёт свой Axios client. SSR signal задан по умолчанию. Interceptor объединяет его с дополнительным requestAbortSignal через AbortSignal.any; дополнительный сигнал не отключает SSR cancellation. В браузере router задаёт сигнал текущей навигации по умолчанию и отменяет предыдущий. При неуспешной навигации сигнал обновляется для продолжающей работать страницы. Store и fetchData страниц не передают сигналы; ручные запросы Lab тоже отменяются при уходе.

Моки и задержки перенесены из клиентского сервиса на сервер в /api/mocks. Endpoints возвращают JSON и no-store до language/SSR middleware. Отмена HTTP-запроса очищает mock timer. Shared API types экспортируются через @app/services. Axios 1.20.0 уже установлен в dependencies; повторная установка и изменение lockfile не нужны. [Описание API и пример](../api.md).

Истечение SSR_RESPONSE_BUDGET_MS отменяет контроллер и возвращает HTTP 500 через error middleware. Отключение клиента прекращает SSR без отправки ответа. Очищается только подтверждённый pending; позднее подтверждение SET NX также очищается. Неподтверждённый pending сохраняется.

execInSsrOrAbort в @app/utils проверяет отмену до запуска callback и после завершения операции. Renderer использует utility для createApp, prefetch и renderToString. Подавленная abort-ошибка не позволяет продолжить SSR; поздний HTML не возвращается и не записывается в кеш. Успешный HTTP-ответ не отменяет SSR signal при очистке таймера. Signal и controller отсутствуют в Context, Pinia, HTML и Redis state.

## Замечания ревью

Удалены общий X-Cache и CacheService.cacheType. X-Cache-Render и X-Cache-Critical-Css сохраняются. Promise prefer-await правила выключены в общем Oxlint config; пять локальных suppress-комментариев удалены. Max-params равен 4 без file override. RedisCache options, условная запись и параметры cacheCriticalCss передаются объектами.

Имена SSR signal/controller, timer signal/controller, response budget и результатов middleware уточнены. createSsrDeadline переименован в createSsrResponseBudget. [Оставшиеся предложения по именам](./naming-review.ru.md) требуют отдельного ревью.

Для async Express 5 endpoints выключен oxc/no-async-endpoint-handlers: правило рассчитано на Express до версии 5. Express 5 передаёт rejected promises в error middleware автоматически; локальных suppress-комментариев нет. [Контракт Express](https://expressjs.com/en/guide/error-handling/).

## Проверки

pnpm check: format, scripts, styles, types и Knip — PASS. Свежие локальная и Docker production сборки — PASS.

На образе codex-bpv-axios-api:20261010 пройдены 9 SSR-сценариев с настоящим Axios HTTP и 10 сценариев API:

- Все четыре API-метода без per-call сигнала; уже отменённый сигнал не запускает HTTP.
- Отмена по бюджету и disconnect закрывают upstream connection; HTML и cache publication отсутствуют.
- Независимый параллельный SSR B завершается, пока A отменяется.
- Подтверждённый pending очищается; неподтверждённый сохраняется; поздний NX acknowledgement удаляется.
- Операция без cancellation может завершиться позже, но её результат не продолжает SSR.
- Успешный ответ не отменяет свой signal после окончания response budget.
- Поздний renderToString не возвращает HTML и не публикует кеш.
- SSR и дополнительный signal отменяют combined request независимо; одинаковые сигналы тоже работают.
- Navigation default отменяет HTTP без аргумента в store; следующий navigation signal позволяет новый запрос.
- Navigation default не отключает базовый SSR signal.
- Обычные success, JSON 404 и controlled JSON 500 сохраняются без SSR signal.

При тестовом бюджете 500 мс HTTP timeout ответил за 519 мс; параллельный B — за 30 мс. Upstream наблюдал закрытие десяти отменённых HTTP connections. Fixtures наблюдают transport/interceptors и вводят тестовые задержки, но не заменяют Axios adapter. Они находятся вне production diff.

| Режим       | HTTP/API                                                                                        | BrowserOS neo                                                                                                              |
| ----------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| dev         | Root, health, языки, страницы, 404 и JS/CSS assets; 8 API endpoints и 5 SSR state checks — PASS | Hydration, query, home/about navigation; failure/retry, shared counter, manual/prefetch cancellation, Atlas → Relay — PASS |
| start:local | Свежая production сборка; тот же HTTP/API smoke — PASS                                          | Свежая вкладка: hydration, query, home/about navigation; console без ошибок/предупреждений — PASS                          |
| Docker      | Свежий image; dedicated Redis, render/CSS caches включены; тот же HTTP/API smoke — PASS         | Hydration, query, home/about navigation; manual cancellation; console без ошибок/предупреждений — PASS                     |

Start:local проверен с отключённым чтением/записью кеша, чтобы исключить HTML предыдущей реализации при неизменной версии 0.0.0. Redis подключался. Docker проверен с обоими кешами на отдельном Redis. Основной Redis не очищался.

В dev старая вкладка получила ожидаемые HMR warnings после изменения browser entry. Финальная проверка выполняется в свежей вкладке. Controlled HTTP 500 — ожидаемый ответ demo API; UI обрабатывает его и повторяет запрос. Полный mobile/scroll QA не повторялся: layout не изменён, пользователь разрешил короткий smoke.

Ранее, до перехода на Axios, отдельно проверены 5 Redis object options/SET/TTL/NX/DELEX сценариев. Текущая API-доработка эту логику не меняла.

Артефакты в каталоге архитектурного ревью: check-ssr-axios-10.mjs, ssr-axios-bootstrap-10.mjs, ssr-axios-renderer-10.cjs, check-axios-api-signals-10.cjs, check-axios-mocks-10.mjs, axios-ssr-results.json, axios-api-signals-results.json, axios-browser-results.json, axios-mocks-{dev,local,docker}.json и recheck-axios-{dev,local,docker}.json. Browser helper axios-showcase-qa разбит на короткие фазы из-за лимита 30 секунд у BrowserOS neo.

## Границы

Механизм отменяет операции с поддержкой AbortSignal. Синхронный JavaScript и стороннюю операцию без cancellation принудительно остановить нельзя; поздний результат не используется. Работа кеша/CSS после отправки HTML сохраняет собственный жизненный цикл. Graceful shutdown остаётся пунктом 10, остальные Redis timeouts — пунктом 15, Piscina — пунктом 13.
