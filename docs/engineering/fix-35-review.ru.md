# Пункт 35: production defaults и минимальный local env

База реализации: d57b5ba; родитель отдельного коммита: 24bda1d. Статус: реализовано, проверено и подтверждено пользователем 10 октября 2026.

## Изменение

Все значения по умолчанию серверной схемы собраны в src/server/env/env-defaults.ts. Схема обращается к envDefaults; заданная переменная окружения имеет приоритет и проходит валидацию.

| Настройка                         | Default           |
| --------------------------------- | ----------------- |
| NODE_ENV / PORT                   | production / 8080 |
| CACHE_RENDER / CACHE_CRITICAL_CSS | true / true       |
| TTL готового HTML / CSS           | 86400 секунд      |
| SSR response budget / CSS budget  | 30000 / 10000 мс  |
| Redis retries / read timeout      | 5 / 1000 мс       |
| LOG_LEVEL                         | info              |
| DEBUG / SERVE_SOURCE_MAPS         | false / false     |

API_URL, языки и Redis-параметры остаются обязательной конфигурацией. DEBUG_ON_KEY и LIVE_RELOAD_PATH по умолчанию не заданы. Вычисляемые пути, VERSION, CACHE_SALT и REDIS_URL остаются в env.ts.

В .env/.env.example активны восемь переменных: ACCEPTED_LANGUAGES, API_URL, DEFAULT_LANGUAGE, NODE_ENV=development, REDIS_HOST, REDIS_PASSWORD, REDIS_PORT, WDS_PORT. Optional server и build-настройки представлены только комментариями с примерами переопределения. Live reload SSR по умолчанию выключен; его можно включить указанным примером. Browser HMR работает через WDS_PORT.

Локальный .env обновлён и остаётся gitignored. Rspack defaults не перенесены в runtime-сервер. Будущий пункт 11 удалит DEBUG из defaults и вычислит его из режима приложения.

## Проверки

pnpm check и git diff --check проходят. В TypeScript source, local dist и свежем Docker dist проверены все 13 defaults, все их переопределения и 41 случай невалидной/отсутствующей конфигурации. Серверная схема не содержит самостоятельных значений .default(...).

| Режим            | Проверка                                                                                                                                             |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| pnpm dev         | Запуск с новым .env; девять HTTP-маршрутов и ассеты; SSR, hydration и home → about → home; консоль neo чистая                                        |
| pnpm start:local | Свежая сборка и запуск с новым .env без временных cache overrides; тот же HTTP/browser smoke; консоль чистая                                         |
| Docker           | Свежий codex-bpv-env-defaults:20261010; только шесть обязательных переменных, без NODE_ENV/PORT/cache overrides; HTTP/browser smoke и чистая консоль |

Реальный Redis подтверждает defaults: TTL HTML 86399764 мс, CSS 86399437 мс сразу после записи; повторный HTTP-запрос получает оба cache-hit заголовка.

SWC в агентском Windows-окружении запускается с ранее согласованным SWC_NATIVE_BINDING_CACHE. Существующее предупреждение DEP0205 относится к SWC register и не появилось из-за этой правки. Временные контейнеры удалены; dev оставлен работающим.

Результаты сохранены вне репозитория: fix-35-env-{source,local}.json, fix-35-runtime-defaults.json, recheck-fix-35-{dev,local,docker}.json и check-env-defaults-35.mjs в каталоге артефактов этой задачи.
