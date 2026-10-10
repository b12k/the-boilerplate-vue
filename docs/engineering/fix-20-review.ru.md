# Пункт 20: HTTP cache policy

Статус: пользователь подтвердил отдельный коммит 10 октября 2026. Пункт 19 подтверждён пользователем и закоммичен: 3241b1c.

## Изменение

Cache-Control по умолчанию — no-store. Middleware находится перед ранними ответами, health, API, static и SSR. Поэтому HTML из свежего SSR и Redis, redirect, 404 и 405 получают одинаковую политику. Error middleware повторно назначает no-store: ошибка чтения файла или Range может произойти уже после установки static headers.

Для успешно найденных статических файлов отдельный callback задаёт политику по имени файла:

| Ресурс                                                            | Cache-Control                       |
| ----------------------------------------------------------------- | ----------------------------------- |
| Production JS, CSS и изображения с content hash из 8 hex-символов | public, max-age=31536000, immutable |
| Manifest и HTML-файлы, включая HTML с хешем                       | no-store                            |
| Разрешённые source maps                                           | private, no-store                   |
| Static без хеша, включая favicon и логотип                        | no-cache                            |
| Development assets от Rspack dev server                           | no-store                            |

Сопоставление хеша соответствует текущим шаблонам Rspack. Основной сервер не применяет годовой TTL в development. Существующий запрет source maps сохраняется; callback не перезаписывает private, no-store.

Favicon отдаётся через GET/sendFile с no-cache и обычной проверкой Last-Modified. Автоматический HEAD и прежние ответы OPTIONS 200 / остальные методы 405 сохранены. Неиспользуемые serve-favicon, его типы и зависимость fresh@0.5.2 удалены из package.json и lockfile.

TTL Redis остаётся внутренней настройкой. Дополнительный HTTP-заголовок TTL не добавлен. Security headers остаются отдельным пунктом 21.

## Проверки

| Проверка                     | Результат                                                                                                                                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| pnpm check                   | Format, knip, scripts, styles, types — PASS                                                                                                                                                            |
| pnpm dev                     | Свежий запуск; 9 HTTP-маршрутов и assets, header matrix на основном сервере и WDS — PASS                                                                                                               |
| pnpm start:local             | Свежая production-сборка; HTTP smoke и 68 проверок headers — PASS                                                                                                                                      |
| Docker                       | Свежая сборка codex-bpv-policy:20261010; HTTP smoke и 68 проверок headers — PASS                                                                                                                       |
| BrowserOS neo                | Все три режима: hydration, home → about → home, query foo=2; консоль без ошибок и предупреждений — PASS                                                                                                |
| Redis render miss/hit        | Local production и Docker: реальный miss и последующий hit возвращают no-store — PASS                                                                                                                  |
| Ошибки и особые ответы       | 17 запросов в отдельном production-контейнере — PASS                                                                                                                                                   |
| Обновление HTML после релиза | В открытом браузере версия тестового контейнера изменена с 0.0.0 на 20.0.1; после рестарта и полной перезагрузки получен новый контекст, URL с release=20 сохранён, navigation transferSize > 0 — PASS |

Матрица проверяет GET, HEAD, query и 304 для реальных JS/CSS, favicon и unhashed logo; manifest, отсутствующий hashed asset, static directory redirect, HTML, 404, 405, health и mock API. Число development assets зависит от lazy compilation; результаты сохраняют фактически проверенные URL.

Профильные fixtures проверяют 500 после ранее установленного immutable, ошибку чтения файла 404, STARTING/DRAINING 503, обычный SSR 500, SSR timeout, debug HTML, static HTML с хешем, доступный source map и сохранение private, no-store для имени .map.deadbeef.js. Файл изображения с хешем проверен через GET, HEAD и 304. Range 206 сохраняет immutable, Range 416 получает no-store.

Проверка обновления HTML использовала явную полную перезагрузку браузера. Минутный polling повторно не тестировался: его код не изменён; сценарий смены версии уже проверен в пункте 18.

Docker image digest: 82263e4cbdcc6050c0517d9856e7282a38196f881f76d9a0fdb4bcbdaa0a6a89. Production-проверки использовали отдельный тестовый Redis. Fixtures и JSON-результаты находятся вне репозитория; тестовые контейнеры удалены. Версия package.json в репозитории остаётся 0.0.0. Development оставлен запущенным для ревью.

## Границы изменения

Код SSR, внутренние кеши, бюджеты и механизм версии не изменены. Полный UI QA, отказ Redis, Piscina и shutdown повторно не проверялись: правка касается HTTP headers и отдачи favicon.

На Windows использован прежний SWC_NATIVE_BINDING_CACHE. После удаления зависимости pnpm повторил SWC postinstall с известной ошибкой стандартного cache path; rebuild с этим параметром прошёл. Известное предупреждение Node о deprecated module.register относится к development. Браузерная консоль чистая.
