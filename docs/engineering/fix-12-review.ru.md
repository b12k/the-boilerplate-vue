# Пункт 12: маскирование секретов в логах

База: a610e1a. Статус: реализовано и проверено; пользователь подтвердил отдельный коммит 10 октября 2026.

## Изменение

LoggerService подключает createLogRedactor через Pino hooks.streamWrite. Очистка выполняется после стандартных serializers и child bindings, до записи JSON или pino-pretty. Общая utility находится в src/server/utils/redact-log.ts и экспортируется через barrel.

Значения чувствительных полей заменяются на [Redacted]. Проверка имён учитывает регистр и разделители: Authorization, Cookie/Set-Cookie, password, credentials/auth, token, secret, API/private key, DEBUG_ON_KEY, ENV_OVERRIDES и session ID. Обрабатываются произвольная вложенность объектов и массивов, сообщения и сериализованные Error/stack.

Известные секреты собираются один раз из REDIS_PASSWORD, DEBUG_ON_KEY и паролей/чувствительных query-параметров настроенных API_URL/REDIS_URL. Их исходные и URL-encoded формы маскируются также под обычными именами, внутри Request ID и имён полей. В строках отдельно скрываются credentials URL, чувствительные query-параметры и Bearer/Basic credentials. Обычные параметры, host/path и описание операции сохраняются.

Редактор работает с отдельной копией сериализованной записи. Исходные Request, Error и payload не меняются; полная HTML-диагностика по доверенному ключу сохраняется. Если очистка не может обработать запись, выводится безопасный JSON с сообщением Log redaction failed; contents omitted вместо исходного содержимого.

Распознавание неизвестных секретов под произвольными именами в произвольном тексте не гарантируется. При добавлении новой конфигурации секретов нужно расширить список LoggerService или политику чувствительных имён.

## Проверки

pnpm check и git diff --check проходят. Fixture-скрипты находятся вне репозитория; новая инфраструктура тестов и CI не добавлена.

| Режим            | Результат                                                                                                                           |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| pnpm dev         | Девять HTTP-маршрутов и ассеты; реальный HTTP-лог не содержит тестовых secrets; hydration и home → about → home; консоль neo чистая |
| pnpm start:local | Свежая сборка; тот же HTTP/browser smoke; production stdout маскируется; консоль чистая                                             |
| Docker           | Свежий codex-bpv-log-redaction:20261010; тот же smoke; полный захват docker logs для HTTP 200/500; консоль чистая                   |

В source, local dist и Docker dist проверено по десять записей реального LoggerService: пять сценариев для production JSON и пять для development pino-pretty. Сценарии включают вложенные массивы, child bindings, обычные сообщения, Error с cause/stack/config, секреты под обычными именами, в именах полей, в Request ID, URL credentials и query. Проверены raw/encoded формы, включая lowercase percent escapes, и отсутствие изменения исходных payload/Error.

Реальный Docker HTTP-тест подтверждает: headers/cookies/query и Axios config не раскрывают тестовые secrets в логах; Request ID с известным ключом маскируется в логе, но сервер возвращает исходный X-Request-ID. Диагностический 500 сохраняет исходные значения в разрешённом HTML. Следующий обычный запрос получает 200 без диагностики; ECONNREFUSED остаётся виден в логе.

## Стоимость и пределы замера

Очистка синхронно разбирает и повторно сериализует каждую запись. Локальный microbenchmark на Node v26.10.0, по 10000 записей после прогрева: 975 байт — 17,40 мкс на запись; 7475 байт — 23,11 мкс. Замер относится только к редактору и не включает log IO, pretty formatting, SSR или нагрузку всего приложения.

Браузерные проверки режимов выполнены в свежих вкладках. Служебные HMR disconnect сообщения старой dev-вкладки при остановке dev не считаются ошибкой production-приложения. SWC использует ранее согласованный SWC_NATIVE_BINDING_CACHE; существующее предупреждение DEP0205 не относится к этой правке.

Dev оставлен работающим; временные тестовые контейнеры удалены. Результаты и fixture-скрипты сохранены в каталоге артефактов задачи: check-log-redaction-12.mjs, check-http-logs-12.mjs, measure-log-redaction-12.mjs, fix-12-logs-{source,local}.json, fix-12-http-*.json, fix-12-redaction-cost.json и recheck-fix-12-{dev,local,docker}.json.
