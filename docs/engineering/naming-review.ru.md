# Обзор неоднозначных имён

Дата: 11 октября 2026. Итог пункта 34; базовый коммит — 16d75bb. Проверены src, Vue, Nunjucks со встроенным JavaScript, rspack и корневые конфигурации.

Исходные 40 групп сверены с итоговым кодом: 38 уточнены или адаптированы, две уже закрыты предыдущими правками. Из трёх необязательных предложений применено headingVariant; локальные имена фабрик классов оставлены.

Названия показывают назначение значения, вид результата и единицу времени. Определения и consumers обновлены вместе. Поведение приложения сохраняется.

## Итог исходных предложений

| №   | Область                        | Итог                                                                                         |
| --- | ------------------------------ | -------------------------------------------------------------------------------------------- |
| 1   | Redis connect controller       | timerAbortController отменяет таймер подключения.                                            |
| 2   | Redis GET controller           | timerAbortController отменяет таймер чтения.                                                 |
| 3   | Redis timeout signals          | timerAbortSignal; поле signal клиента сохраняется.                                           |
| 4   | Redis DELEX result             | deletedKeysCount — число удалённых ключей.                                                   |
| 5   | Redis conditional SET result   | setReply — ответ OK или null.                                                                |
| 6   | Redis GET value                | cachedValue — прочитанное значение.                                                          |
| 7   | Critical CSS controller        | Уже закрыто: cssAbortController после внедрения Piscina.                                     |
| 8   | Critical CSS expiration        | budgetExpiresAtMs — граница бюджета по performance.now().                                    |
| 9   | PurgeCSS result                | purgeResults в worker — массив результатов.                                                  |
| 10  | Critical CSS result            | criticalCss — итоговая строка стилей.                                                        |
| 11  | SSR client manifest            | clientManifestJson / clientManifest; возвращаемое поле manifest сохраняется.                 |
| 12  | SSR decache entry              | ssrModulePath — путь серверного модуля.                                                      |
| 13  | SSR assets pending             | assetsLoadPromise — ожидаемая загрузка snapshot.                                             |
| 14  | Idempotency matched            | matchedCacheRule — выбранное правило кеша.                                                   |
| 15  | Idempotency pattern            | routePattern — шаблон маршрута.                                                              |
| 16  | Idempotency parameters         | routeParams — параметры маршрута.                                                            |
| 17  | Idempotency before/after key   | cacheKeyPrefix / cacheKeySuffix — части вычисляемого ключа.                                  |
| 18  | Idempotency computed key       | routeCacheKey — часть ключа от правила маршрута.                                             |
| 19  | Mock failure option            | shouldSimulateFailure в API, store, странице и типе события. Query-поле fail сохраняется.    |
| 20  | Showcase request count         | completedRequestsCount; отменённые вызовы не учитываются.                                    |
| 21  | Showcase request sequence      | runRequestSequence / currentRunRequestSequence — порядок запросов run.                       |
| 22  | Showcase getters               | currentProject / latestRunResult; локальный ответ — runResult.                               |
| 23  | Route prefetch signal          | prefetchAbortSignal в нашем конфигурационном объекте и обоих entry.                          |
| 24  | Route prefetch components      | componentsToPrefetch — отобранные компоненты.                                                |
| 25  | Route prefetch promise         | prefetchPromise — Promise набора задач.                                                      |
| 26  | Lab diagnostic rows            | diagnosticRows; понятный prop ContextPanel.rows сохраняется.                                 |
| 27  | Pinia creation                 | pinia — контейнер createPinia; возвращаемое поле и SSR consumer обновлены.                   |
| 28  | Store HMR context              | hmrContext; обязательное поле data адаптера Pinia сохраняется.                               |
| 29  | Store HMR sessions             | previousStoreSession / storeSession / storeSessionsByHotData; callback принимает hotData.    |
| 30  | Store HMR definition/arguments | storeDefinition / storeArguments; поле нашей StoreSession обновлено.                         |
| 31  | Server / Rspack env result     | envParseResult в обоих модулях.                                                              |
| 32  | Rspack env variables           | envVariables — разобранные настройки.                                                        |
| 33  | Manifest reducer               | assetPaths / assetPath / assetPathsByType.                                                   |
| 34  | Manifest asset groups          | initialAssets / asyncAssets; JSON-ключи initial / async сохраняются.                         |
| 35  | Vendor package regex           | packagePathMatch — результат поиска пути пакета.                                             |
| 36  | HTTP logger                    | requestIdHeader / httpLoggerOptions / prettyLogStream.                                       |
| 37  | Helmet options                 | Уже закрыто: после пункта 21 отдельной переменной options нет.                               |
| 38  | Health time                    | serviceStartedAtMs; публичный JSON-ключ uptime сохраняется, значение — миллисекунды.         |
| 39  | Live reload                    | liveReloadUrl / retryDelayMs / attemptIndex / maxConnectionAttempts / liveReloadEventSource. |
| 40  | 404 target                     | notFoundPageUrl — URL клиентской страницы.                                                   |

## Необязательные предложения

| Предложение                                                                | Решение                                                                                                                          |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| actionStyles / containerStyles                                             | Не применено: локальная фабрика классов понятна из вызова tv и области использования.                                            |
| cardStyles / sectionStyles / logoStyles / badgeStyles / statusSymbolStyles | Не применено по той же причине; одинаковый суффикс не добавляет полезного смысла.                                                |
| headingVariant                                                             | Применено в InfoCard, CardSection и page-about. mono/plain задают оформление, а не уровень HTML heading. Документация обновлена. |

## Контракты и проверка

Внутренние поля Pinia requestsCount и requestSequence переименованы. Проверены их SSR serialization, hydration, consumers, отмена запросов и сохранение состояния при навигации. Обновлены getters и props компонентов.

HTTP-поля health, mock API и JSON-ключи manifest сохранены. Стандартные signal/data/filename, request/response Express и to/from Vue Router остаются. Экспортируемые имена модулей не менялись; правок barrel-файлов не требуется.

Обычные app/router/head, styles внутри компонента и key/value в общем словаре понятны в своей области. Удлинение таких имён само по себе не улучшает код.

Проверки и ограничения: [отчёт пункта 34](./fix-34-review.ru.md). Пользователь подтвердил отдельный коммит 11 октября 2026.
