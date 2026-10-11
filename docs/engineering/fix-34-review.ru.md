# Пункт 34 — явные имена

Статус: реализован и проверен 11 октября 2026. Пользователь подтвердил отдельный коммит.
Базовый коммит: 16d75bb.

Последний пункт списка уточняет назначение переменных без изменения алгоритмов. Исходные 40 групп сверены с текущим кодом: 38 уточнены или адаптированы, две уже закрыты прежними пунктами. Полная сверка — в [обзоре имён](./naming-review.ru.md).

Основные изменения:

- pinia вместо store для контейнера createPinia; prefetchAbortSignal для отмены route prefetch.
- completedRequestsCount, runRequestSequence, currentProject и latestRunResult в showcase store и его consumers.
- Явные имена таймеров Redis, ответов команд, загрузки SSR assets, частей cache key и результатов PurgeCSS.
- hmrContext и storeSessionsByHotData для HMR; envParseResult и envVariables для окружения.
- Единицы времени в budgetExpiresAtMs, serviceStartedAtMs и retryDelayMs.
- headingVariant вместо heading для оформления InfoCard/CardSection; пример и документация обновлены.

Внутренние поля сериализуемого showcase state и props переименованы вместе с consumers. Поля HTTP health и mock API, JSON-ключи manifest и стандартные поля библиотек сохранены. Экспортируемые имена модулей не менялись. Необязательные суффиксы Styles у понятных локальных фабрик не добавлены.

## Проверки

| Проверка                                                                                                 | Результат |
| -------------------------------------------------------------------------------------------------------- | --------- |
| pnpm check: types, scripts, styles, format, knip                                                         | PASS      |
| Свежие dev, start:local и Docker из текущих исходников                                                   | PASS      |
| Каждый режим: 9 HTTP-маршрутов, SSR state и доступные JS/CSS                                             | PASS      |
| Каждый режим: новые поля state, awaited lab prefetch, шесть параллельных SSR с разными проектами         | PASS      |
| Каждый режим: прежние поля JSON health и manifest                                                        | PASS      |
| Production: общий render-cache для разных query, актуальный query в Context                              | PASS      |
| BrowserOS neo во всех режимах: hydration, Home → About → Home и query state                              | PASS      |
| Все режимы: mock success / controlled 500 / retry, сохранение counter, Atlas → Relay                     | PASS      |
| Отмена ручного запроса и route prefetch: XHR abort; отменённый вызов не увеличивает счётчик              | PASS      |
| Dev HMR: изменение getter без перезагрузки app и потери counter; исходник восстановлен                   | PASS      |
| SSR assets: шесть сценариев production snapshot, параллельной загрузки, retry и development decache      | PASS      |
| Redis 8.10.2: семь сценариев SET IFEQ / DELEX IFEQ и debug refresh                                       | PASS      |
| Redis: close/destroy во время handshake и до TCP connect, таймеры и сокеты закрываются                   | PASS      |
| Production: реальный critical CSS опубликован worker и используется в HTML                               | PASS      |
| Nunjucks: live reload URL, reconnect 300 мс, 10 попыток, reload после восстановления, URL клиентской 404 | PASS      |
| Production: Request ID клиента и новые сгенерированные ID; headingVariant сохраняет классы               | PASS      |
| Консоли свежих browser smoke во всех режимах                                                             | PASS      |

Отмена вручную и при prefetch проверена в dev; manual дополнительно в start:local, prefetch — в Docker. Повторять одинаковую матрицу во всех режимах не потребовалось по согласованному сокращённому плану.

Профильные fixture-скрипты находятся вне репозитория. Старые сценарии адаптированы к актуальному объекту аргументов Redis и новым полям state. Первоначальное сравнение cache miss с cache hit было исправлено в проверке: X-Cache-Render появляется только при попадании. Проверка отмены использует событие XHR abort, чтобы не зависеть от того, успеет ли наблюдатель поймать короткий pending. Ошибки этих проверочных сценариев не потребовали изменения логики приложения.

## Окружение и ограничения

Node 26.10.0, pnpm 12.9.1. Для Windows сохранён согласованный SWC_NATIVE_BINDING_CACHE. В dev остаётся известное предупреждение Node DEP0205 о module.register().

Во время временного HMR-изменения наблюдалось предупреждение Rspack Cannot find update; обе проверки сохранения экземпляра app и counter прошли. Консоль отдельного свежего dev smoke чистая. Намеренный ответ mock API 500 относится к проверке обработки ошибки.

Production smoke использует отдельный Redis на порту 38180; пользовательский Redis не очищался. Docker image: codex-bpv-names:20261011, порт 38181. Digest: sha256:bc8b4eb7976abd49f4b86dfe1e7243d6da77bee86320845a464bf618a25c512d.

Собственные fixture-контейнеры остановлены и удалены. Обычный dev восстановлен на localhost:8080 для пользовательского ревью.

Оформление не меняется; визуальный screenshot не требовался. Highload benchmark и дополнительные браузерные матрицы этим пунктом не выполнялись.

## Артефакты

- HTTP smoke: [dev](C:/Users/Bogdan/.codex/visualizations/2026/10/06/01a112d7-8591-7e62-865d-b78cb2d66cbe/recheck-fix-34-dev.json), [local](C:/Users/Bogdan/.codex/visualizations/2026/10/06/01a112d7-8591-7e62-865d-b78cb2d66cbe/recheck-fix-34-local.json), [Docker](C:/Users/Bogdan/.codex/visualizations/2026/10/06/01a112d7-8591-7e62-865d-b78cb2d66cbe/recheck-fix-34-docker.json).
- SSR state и контракты: [dev](C:/Users/Bogdan/.codex/visualizations/2026/10/06/01a112d7-8591-7e62-865d-b78cb2d66cbe/names-runtime-34-dev.json), [local](C:/Users/Bogdan/.codex/visualizations/2026/10/06/01a112d7-8591-7e62-865d-b78cb2d66cbe/names-runtime-34-local.json), [Docker](C:/Users/Bogdan/.codex/visualizations/2026/10/06/01a112d7-8591-7e62-865d-b78cb2d66cbe/names-runtime-34-docker.json).
- [SSR assets](C:/Users/Bogdan/.codex/visualizations/2026/10/06/01a112d7-8591-7e62-865d-b78cb2d66cbe/names-assets-34.json), [Redis shutdown](C:/Users/Bogdan/.codex/visualizations/2026/10/06/01a112d7-8591-7e62-865d-b78cb2d66cbe/names-redis-shutdown-34.json).
- [Nunjucks, CSS и Request ID](C:/Users/Bogdan/.codex/visualizations/2026/10/06/01a112d7-8591-7e62-865d-b78cb2d66cbe/names-inline-and-css-34.json), [XHR abort](C:/Users/Bogdan/.codex/visualizations/2026/10/06/01a112d7-8591-7e62-865d-b78cb2d66cbe/names-cancel-34.json).
- [Итоговый browser smoke](C:/Users/Bogdan/.codex/visualizations/2026/10/06/01a112d7-8591-7e62-865d-b78cb2d66cbe/names-browser-smoke-34.json).

Пользователь подтвердил отдельный коммит пункта 34. Других пунктов реализации в согласованном списке не остаётся.
