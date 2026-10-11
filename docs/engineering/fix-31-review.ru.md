# Пункт 31 — документация

Статус: реализован и проверен 11 октября 2026. Пользователь подтвердил отдельный коммит.
Базовый коммит: 90d0244.

README теперь представляет бойлерплейт: логотип, конкретные преимущества, быстрый запуск и демонстрационные сценарии. Текст написан простым техническим английским, с короткими инструкциями и ссылками на исходники.

Подробности вынесены в три небольших руководства без повторения быстрого запуска:

- [Build pages](../app.md): SSR data flow, page hooks, Pinia, atomic design, Unhead, assets, redirects и фабрики сервисов.
- [Connect an API](../api.md): конфигурация Axios из контекста, отмена SSR и браузерных запросов, типы и реальные mock endpoints.
- [Run the server](../server.md): обязательные env, production, Docker, кеш, CSS pool, health, версия, shutdown и диагностика.

Описания сверены с итоговым кодом. Указаны Redis 8.4+, отсутствие автоматической загрузки .env у pnpm start, исчерпание reconnect-попыток до перезапуска, pending без ожидания, HTTP no-store независимо от Redis TTL и окно между переключением релиза и version polling. Производительность под highload не заявлена без измерений.

Исходники приложения, конфигурация, зависимости и lockfile в этом пункте не меняются. Русские инженерные отчёты остаются историей ревью.

## Проверки

| Проверка                                                                    | Результат |
| --------------------------------------------------------------------------- | --------- |
| pnpm check: types, scripts, styles, format, knip                            | PASS      |
| 20 локальных ссылок, включая логотип и исходники                            | PASS      |
| Команды существуют в package.json; env-примеры актуальны и без секретов     | PASS      |
| Vue-пример из документации проверен через vue-tsc в отдельной копии         | PASS      |
| Чистый checkout без .env и node_modules: frozen install создаёт .env        | PASS      |
| corepack enable и pnpm docker:up в отдельном Compose project                | PASS      |
| Свежие dev и start:local в этом checkout                                    | PASS      |
| Свежий Docker image из текущего workspace                                   | PASS      |
| Все три режима: 9 HTTP-маршрутов, SSR state и доступные JS/CSS assets       | PASS      |
| Все три режима: mock JSON 200/404/500, health, HEAD/405, Request ID и nonce | PASS      |
| BrowserOS neo во всех режимах: hydration, query state, Home → About → Home  | PASS      |
| Браузерные консоли во всех режимах                                          | PASS      |

Выполнена ручная вычитка: README остаётся точкой входа, детали разделены по задачам, термины единообразны. Соответствие формальному стандарту ASD-STE100 не сертифицировалось. Красоту и читаемость пользователь оценивает при ревью.

## Окружение

Quick start проверен на новой локальной копии базового коммита, без .env и зависимостей. Использован существующий pnpm store; это не переустановка операционной системы. Node 26.10.0, pnpm 12.9.1 и Docker Desktop уже установлены. Corepack успешно включён.

Из-за занятого пользовательским Redis порта использован документированный override REDIS_PORT=38180. Test Compose project: codex-bpv-docs31. Пользовательский Redis не очищался. Собственные контейнеры остановлены; команда pnpm docker:down также проверена.

На Windows сохранён ранее согласованный SWC_NATIVE_BINDING_CACHE для обхода ограничения доступа к native binary. В dev присутствует прежнее предупреждение Node DEP0205 о module.register(); запуск успешен. Новых runtime-ограничений правка не добавляет.

Docker image: codex-bpv-docs:20261011. Проверен на порту 38181 с отдельным Redis. Digest: sha256:e448a623701a6258c725cbacac8a38429c819c5708cfd045ec041055b85a1952.

Dev основного workspace восстановлен на localhost:8080 для пользовательского ревью. Screenshot не требовался: оформление приложения не менялось.

## Артефакты

- [README](../../README.md), [app](../app.md), [API](../api.md), [server](../server.md).
- [Проверка документации](C:/Users/Bogdan/.codex/visualizations/2026/10/06/01a112d7-8591-7e62-865d-b78cb2d66cbe/docs-31-check.json).
- HTTP smoke: [dev](C:/Users/Bogdan/.codex/visualizations/2026/10/06/01a112d7-8591-7e62-865d-b78cb2d66cbe/recheck-fix-31-dev.json), [local](C:/Users/Bogdan/.codex/visualizations/2026/10/06/01a112d7-8591-7e62-865d-b78cb2d66cbe/recheck-fix-31-local.json), [Docker](C:/Users/Bogdan/.codex/visualizations/2026/10/06/01a112d7-8591-7e62-865d-b78cb2d66cbe/recheck-fix-31-docker.json).
- HTTP-контракт документации: [dev](C:/Users/Bogdan/.codex/visualizations/2026/10/06/01a112d7-8591-7e62-865d-b78cb2d66cbe/docs-http-31-dev.json), [local](C:/Users/Bogdan/.codex/visualizations/2026/10/06/01a112d7-8591-7e62-865d-b78cb2d66cbe/docs-http-31-local.json), [Docker](C:/Users/Bogdan/.codex/visualizations/2026/10/06/01a112d7-8591-7e62-865d-b78cb2d66cbe/docs-http-31-docker.json).

Перед коммитом требуется подтверждение пользователя по согласованному порядку. После подтверждения — отдельный коммит пункта 31 и переход к последнему пункту 34: ревью имён.
