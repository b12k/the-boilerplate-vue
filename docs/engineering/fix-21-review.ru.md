# Пункт 21 — единые security headers

Статус: реализован и проверен 11 октября 2026. Пользователь подтвердил отдельный коммит 11 октября 2026.

## Изменение

Общие Helmet headers устанавливаются перед live reload, favicon, health, readiness, API, language redirect и static. Middleware создаётся один раз; X-Powered-By отключён также на уровне Express.

CSP с nonce устанавливается для SSR, HTML fallback и language redirect. Обработчик ошибок применяет ту же функцию: ранняя ошибка до SSR получает CSP, а ошибка после подготовки HTML сохраняет nonce текущего запроса. Тип request.nonce стал optional, поскольку JSON, static и SSE не создают nonce.

Существующие CSP directives сохранены: development допускает локальные HTTP/WebSocket endpoints и eval-source-map; production включает HSTS и upgrade-insecure-requests, не разрешает unsafe-eval. Список внешних источников относится к отдельному пункту 26.

## Проверки

| Проверка                                                                                    | Результат |
| ------------------------------------------------------------------------------------------- | --------- |
| pnpm check: format, types, scripts, styles, knip                                            | PASS      |
| Свежий dev: 9 основных маршрутов и их assets; 21 проверка headers/CSP                       | PASS      |
| Свежий start:local: 9 основных маршрутов и их assets; 29 проверок headers/CSP               | PASS      |
| Свежая Docker-сборка: 9 основных маршрутов и их assets; 29 проверок headers/CSP             | PASS      |
| Отдельный профиль ошибок: 12 сценариев                                                      | PASS      |
| BrowserOS neo: hydration, query state и home → about → home во всех режимах                 | PASS      |
| Production browser: CSP violations отсутствуют, консоль без ошибок и предупреждений         | PASS      |
| Debug HTML: JSON viewer работает, четыре script nonce совпадают, CSP violations отсутствуют | PASS      |

HTTP-проверки охватывают десять общих защитных заголовков, отсутствие X-Powered-By, HSTS только в production, HTML CSP, nonce inline scripts, GET/HEAD, favicon, API, static, manifest, source-map rejection и HTTP 404/405. Два подтверждённых render-cache hit в каждом режиме имеют разные nonce.

Профиль ошибок проверяет ранний 500 без исходного nonce, ошибку sendFile 404, STARTING/DRAINING 503, SSR 500, HEAD, SSR timeout, debug HTML и разрешённый source map. Также проверено, что app.enabled('x-powered-by') возвращает false и ранний JSON handler не имеет nonce.

Development с LIVE_RELOAD_PATH=__live-reload: SSE подключается, inline script имеет nonce, общие headers присутствуют, CSP не блокирует соединение. HMR JSON/JS updates загружаются с 200, CSP violations отсутствуют. При временном изменении CSS Rspack выдал Cannot find update. Need to do a full reload! и перезагрузил вкладку; сохранение состояния через CSS hot update не подтверждено. Конфигурация HMR этим пунктом не меняется. Временная CSS-правка восстановлена побайтово.

Docker image: sha256:d8cbe3832f4658bd655832e12fe962cd0e557a5fed323531dada9990137aed2d. Production использовал отдельный тестовый Redis; fixtures и результаты находятся вне репозитория. Тестовые контейнеры удалены, приложение завершилось с exit code 0. Development оставлен запущенным для ревью.

## Границы изменения

SSR, render-cache, critical CSS, бюджеты и версия не менялись. Полный UI QA и проверки отказа Redis, Piscina и shutdown повторно не выполнялись. Использован прежний Windows SWC_NATIVE_BINDING_CACHE; известное предупреждение Node о module.register относится к development.
