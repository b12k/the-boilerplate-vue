# Пункт 16: pathname в matcher render-cache

Базовый коммит: b7a974d. Пользователь подтвердил ревью и отдельный коммит 8 октября 2026.

computeIdempotencyKey отделяет pathname через split('?')[0] перед trimSlashes и передаёт его в path-to-regexp. Query больше не мешает сопоставлению с настроенным маршрутом /:lang. Значения query сохраняются в Context текущего запроса, включая cache hit.

Конфигурация ключей сохраняется: язык и тип устройства определяют варианты кеша. Для настроенных страниц принимается согласованный контракт: query не меняет кешируемый HTML. Маршруты, отсутствующие в idempotencyConfig, не получают render-cache.

## Проверки

| Режим                    | Запуск                                           | Результат                                               |
| ------------------------ | ------------------------------------------------ | ------------------------------------------------------- |
| Windows development      | pnpm dev                                         | PASS: HTTP smoke, SSR, hydration, навигация и консоль   |
| Windows local production | pnpm start:local со свежей сборкой               | PASS: сборка и тот же короткий smoke                    |
| Docker production        | свежий codex-bpv-fix16:20261008; отдельный Redis | PASS: сборка, короткий smoke и профильные проверки кеша |

- В отдельном Redis холодный /en?foo=1 создаёт запись. /en, /en?foo=2, /en/?foo=3 и /en?foo=%3F&tag=a%26b используют тот же ключ. Query текущего запроса правильно декодирован и присутствует в INITIAL_STATE; context.cached содержит исходный query.
- /de и мобильный /en получают другие ключи. После всех query-вариантов Redis содержит ровно три render-записи: desktop en, desktop de и mobile en.
- /en/about?foo=1 и /en/about?foo=2 не используют render-cache: маршрут не настроен.
- Проверен сырой RenderResult в Redis: сохранён исходный query; готовый HTML переиспользуется при запросе с другим query.
- Во всех трёх режимах: root 302 с Location /en, health 200, Home на en/de, About, Lab и Atlas 200; отсутствующие маршрут и язык 404. Начальные store сериализуются, локальные JS/CSS assets отвечают 200.
- BrowserOS neo во всех трёх режимах: /en?foo=2 проходит hydration с query.foo = 2, Home → About → Home работает, title обновляется. Консоль без ошибок и предупреждений.
- При переключении режимов старая dev-вкладка сохранила сообщения об отключённом rspack-dev-server. Консоль start:local перепроверена в новой вкладке: ошибок и предупреждений нет.
- Финальная реализация со split проверена повторно после замечания пользователя. pnpm check: format, scripts, styles, types и knip — PASS. git diff --check — PASS.

Полный UI QA не повторялся: выполнены короткий smoke во всех режимах и проверки затронутого механизма по согласованному порядку.

Временные Docker-приложение и Redis удалены; образ сохранён. Dev восстановлен на localhost:8080. Для запусков Windows использован отдельный SWC cache root процесса агента; конфигурация проекта ради этого не менялась.

Сценарии и результаты находятся в папке артефактов: check-pathname-16.mjs, fix-16-pathname.json и recheck-fix-16-dev/local/docker.json.
