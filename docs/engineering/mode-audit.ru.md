# Проверка актуальности правок: пункт 33

Дата: 8 октября 2026. Исходный commit кода: `4e38d15`. Повторная проверка запуска выполнена после `46a0156`. Код приложения в рамках аудита не менялся.

Пункты 1–31 остаются актуальны. Часть требований уже выполнена: свежий X-Request-ID в ответе, владелец и TTL для critical CSS, клиентская отмена prefetch и часть конфигурации Stylelint. Эти части не нужно реализовывать повторно. Пункт 32 подтверждён во всех трёх режимах; dev и start:local дополнительно перепроверены на Windows через PowerShell.

## Режимы и условия

| Режим                                     | Фактический запуск                                                                | Результат                                                                   |
| ----------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| dev на Windows, Git Bash пользователя     | Работающий пользовательский pnpm dev, Node 26.10.0                                | PASS для запуска, SSR и hydration; подтверждено в neo                       |
| dev на Windows, PowerShell агента         | pnpm dev, Node 26.10.0, pnpm 12.9.1, отдельный SWC cache root                     | PASS: SSR, hydration, навигация, mock API, отмена, mobile, scroll и консоль |
| start:local на Windows, PowerShell агента | pnpm start:local с тем же SWC cache root                                          | PASS: свежая production-сборка и все повторные smoke-сценарии               |
| dev на Linux                              | pnpm dev в builder-окружении из текущего Dockerfile                               | PASS: SSR, hydration, навигация, HMR Vue/CSS, mock API и mobile             |
| start:local на Linux                      | pnpm start:local в отдельном builder-окружении                                    | PASS: свежая production-сборка, SSR и браузерные сценарии                   |
| Docker production                         | Свежий docker build -t codex-bpv-recheck:20261008 . и штатный pnpm start в runner | PASS: сборка, запуск и все повторные smoke-сценарии                         |

Linux-запуски dev и start:local выполняют именно скрипты package.json. Dependencies установлены по frozen lockfile. Docker build использует валидный кеш слоёв текущего дерева; сборка приложения выполнена заново. Docker проверен с отдельным Redis 8. Повторные Windows smoke-запросы использовали штатный Redis через приложение; fault injection и прямые административные команды к пользовательскому Redis не выполнялись.

Исходный .env сохранён. Права существующих каталогов и зависимости проекта не менялись. Dev проверен по localhost, совпадающему с generated publicPath. Предыдущая Linux dev-проверка через 127.0.0.1 фиксировала resource error при загрузке скрипта с localhost; причина этого отдельного наблюдения не установлена. Mount и работа кнопок проверяются явно, отсутствие console error не подменяет hydration.

## Windows SWC и CSP

Первый запуск через инструмент агента остановился с ERR_SWC_NATIVE_CACHE: SWC отклонил дополнительный SID с правами замены файлов в ACL каталога LOCALAPPDATA/swc. Проверка доверенности корня и его предков описана в [документации SWC](https://github.com/swc-project/swc/blob/main/docs/native-addon-carriers.md). Пользовательский запуск через Git Bash работал; пользователь также подтвердил PowerShell.

Переустановка node_modules не понадобилась. Для процесса агента создан отдельный временный кеш в C:/Users/Bogdan/.codex/.tmp-swc-runtime-20261008. SWC_NATIVE_BINDING_CACHE задан только в окружении запуска, без изменения .env или scripts. require('@swc/core') вернул 1.16.13, после этого успешно запущены pnpm dev и pnpm start:local.

Пользователь установил причину симптома в Firefox: JavaScript был выключен. Исправление CSP по этому сообщению отменено; код CSP не менялся. В neo подтверждены hydration и отсутствие securitypolicyviolation. Плановый пункт 21 о единых security headers остаётся отдельной согласованной задачей.

## Повторная проверка на Windows и свежем Docker

- HTTP smoke: root 302 с Location /en, health 200, /en и /de, About, Lab и Atlas 200, неизвестный маршрут и язык 404.
- Проверены сериализуемые store и все локальные script/link assets из HTML: 12 ресурсов на страницу в dev, 9 в production. Все отвечают 200.
- Counter 6 → 7 и getter 12 → 14 сохраняются при навигации; ошибка и retry Lab проходят; Atlas → Relay обновляет данные и title.
- Отмена mock request при уходе не увеличивает completed count: 1 → 3 после двух завершённых запросов.
- Home, About, Lab, Atlas и 404 после hydration имеют clientWidth = scrollWidth = 390.
- Wheel 400 px → About 0 px → Back 400 px во всех трёх режимах.
- Новые вкладки после запуска имеют чистую консоль; JS/CSP-событий ошибки нет. Старую dev-вкладку с WebSocket reconnect-сообщениями после остановки сервера заменили новой.
- Один dev mobile-прогон упёрся в 30-секундный лимит инструмента. Viewport явно восстановлен, сценарии повторены частями и прошли. Последующая проверка wheel выполнена на Home.
- [HTTP-результаты повторной проверки](./runtime-recheck-http.json). BrowserOS neo использовал сохранённые showcase core/cancel/layout/scroll helpers.
- Тестовый production-процесс и новый Docker-контейнер остановлены. Dev снова запущен на localhost:8080 с временным SWC cache root.

## Проверенные сценарии

- SSR Overview, About, Lab, Atlas, Relay и Folio содержит данные API и сериализуемый Pinia state.
- Lab SSR ожидает prefetch, несмотря на `noPreFetchAwait` для клиента.
- 20 параллельных SSR project-запросов сохраняют отдельные store и правильные project ID.
- Языковые URL, root 302 с Location, клиентская 404, manifest JS/CSS и исходный логотип работают.
- BrowserOS neo: counter 6 → 7, getter 12 → 14 сохраняются при переходах; Lab показывает загрузку, ошибку и retry; Atlas → Relay обновляет данные и title.
- Ручной mock-запрос отменяется при уходе. Счётчик completed calls меняется 1 → 3 за два завершённых вызова; отменённый вызов не учитывается.
- На ширине 390 px все пять типов страниц после hydration имеют clientWidth = scrollWidth = 390 во всех режимах. Viewport сброшен после тестов.
- Wheel 400 px → переход About 0 px → Back 400 px во всех режимах. Автоматизация не прокручивала ссылку перед переходом.
- Dev HMR обновил title и Tailwind accent без перезагрузки. Fixtures менялись только внутри тестового контейнера, затем восстановлены.
- В браузерной консоли после успешных сценариев нет ошибок и предупреждений. Dev server сообщает предупреждения persistent cache о type-only alias и deprecation `module.register()`; сборку и HMR они не блокируют.

## Матрица актуальности

Р — предпосылка подтверждена runtime-проверкой. К — подтверждена текущим кодом или конфигурацией; полный fault-сценарий этого пункта здесь не выполнялся. Ч — часть уже реализована, остальная работа нужна. Н — не применимо в этом режиме. Г — согласованная реализация готова и прошла проверки. Для К одинаковый исходный механизм используется во всех трёх режимах; это не заявление о выполнении всех будущих тестов приёмки.

| №   | Правка                             | dev, Linux | start:local, Linux | Docker | Доказательство и остаток                                                                                                                                                                  |
| --- | ---------------------------------- | ---------- | ------------------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Pending render-cache               | Р          | Р                  | Р      | 12 одновременных холодных запросов дали 12 render misses. RenderResult вычисляется для каждого; lock для HTML отсутствует.                                                                |
| 2   | Request ID вне контекста           | Ч/Р        | Ч/Р                | Ч/Р    | Свежий header уже работает, но state.context.requestId и state.context.cached.requestId присутствуют в HTML.                                                                              |
| 3   | Общий CACHE_SALT                   | К          | К                  | К      | Два отдельных поля и env overrides сохраняются. Development уже использует время запуска.                                                                                                 |
| 4   | Redis retries = 5                  | К          | К                  | К      | Первый connect не повторяется; после успешного подключения reconnect не ограничен числом попыток. Конфигурации retries нет.                                                               |
| 5   | Redis GET ≤ 1000 ms                | Р          | Р                  | Р      | При CLIENT PAUSE 2500 ALL ответ занял 2440 / 2403 / 2474 ms. Предел ожидания отсутствует.                                                                                                 |
| 6   | SSR assets в памяти                | Ч/Р        | Р                  | Р      | Каждый запрос читает manifest. Удаление manifest после старта даёт 500 даже на прогретом render-cache. Dev reload/decache нужно сохранить.                                                |
| 7   | Удаление LRU                       | К          | К                  | К      | LruCache и fallback существуют; REDIS_URL optional даже при включённом кеше.                                                                                                              |
| 8   | SSR budget 15 sec                  | К          | К                  | К      | Middleware не создаёт общий deadline; timeout critical CSS ограничивает только его задачу.                                                                                                |
| 9   | Базовый SSR AbortSignal в API      | Ч/К        | Ч/К                | Ч/К    | Клиентская отмена уже работает. SSR создаёт отдельный prefetch signal, не связанный с HTTP disconnect/deadline; createApi не принимает базовый signal.                                    |
| 10  | Graceful shutdown                  | Р/К        | Р/К                | Р/К    | SIGTERM/SIGINT handlers, draining и отслеживание задач отсутствуют. Assets не прогружаются до listen; health остаётся 200 при недоступном manifest.                                       |
| 11  | DEBUG из режима                    | Р/К        | Р/К                | Р/К    | В тестовом dev DEBUG false по умолчанию; поле по-прежнему читается из env. DEBUG_ON_KEY сохраняется.                                                                                      |
| 12  | Redaction логов                    | Р          | Р                  | Р      | Синтетические Bearer token и session cookie видны в логах health-запроса. Реальные секреты в тесте не использовались.                                                                     |
| 13  | Critical CSS в Piscina             | Н/К        | К                  | К      | В production PurgeCSS выполняется в HTTP-процессе. Dev manifest не содержит отдельных CSS: vue-style-loader работает через JS. Pending owner/TTL уже реализованы, их сохраняем.           |
| 14  | Health: readiness + version        | Р          | Р                  | Р      | Ответ содержит только status/uptime; health 200 при 500 на HTML из-за отсутствующего manifest.                                                                                            |
| 15  | Тайм-аут остальных Redis-команд    | К          | К                  | К      | SET, SET NX и EVAL не имеют предела ожидания. isReady не ограничивает команду, уже отправленную в соединение.                                                                             |
| 16  | Pathname в matcher                 | Р          | Р                  | Р      | /en кешируется, /en?utm_source=a и b не дают render hit. Query сохраняется в контексте. Здесь query отключает совпадение, а не размножает записи.                                         |
| 17  | Assets текущего маршрута           | Ч/К        | Р/К                | Р/К    | Production HTML prefetch-ит все async JS из manifest. Dev CSS живёт в JS; будущий mapping должен работать с обоими форматами.                                                             |
| 18  | Client version/recovery            | К          | К                  | К      | Нет polling health или reload-механизма; router.onError только логирует и отменяет prefetch.                                                                                              |
| 19  | SSR только GET                     | Р          | Р                  | Р      | POST /en возвращает 200 HTML. Автоматический HEAD уже отвечает 200 с пустым body; его сохраняем.                                                                                          |
| 20  | HTTP cache policy                  | Р          | Р                  | Р      | HTML и health без Cache-Control; manifest public,max-age=604800. Production hashed JS также 7d без immutable.                                                                             |
| 21  | Общие security headers             | Р          | Р                  | Р      | CSP есть у HTML, но отсутствует на root redirect/health; static без nosniff. X-Powered-By у ранних ответов сохраняется.                                                                   |
| 22  | Версия / non-root / CMD node       | К          | К                  | Р      | npm_package_version обязателен. Прямой Node в runner падает без него. UID runner = 0, CMD = pnpm start.                                                                                   |
| 23  | Текст 500                          | Р          | Р                  | Р      | При отсутствии manifest HTTP 500 содержит пустой body. Английского сообщения нет.                                                                                                         |
| 24  | Unhead и lang                      | Р/К        | Р/К                | Р/К    | В HTML по два charset и viewport; zoom запрещён. Lang задаётся вручную шаблоном, app.vue не читает его для useHead.                                                                       |
| 25  | HTTP redirects из router           | К          | К                  | К      | Renderer возвращает только текущий route/html/state, middleware не формирует Location по redirectedFrom. Обычного бизнес-redirect в демо нет; 404 намеренно внутренний и работает.        |
| 26  | Generic defaults                   | Р/К        | Р/К                | Р/К    | Umami script/ID и разрешения Picsum сохраняются; default title автора в app.vue. Google Fonts оставляем по согласованию.                                                                  |
| 27  | Vendor name                        | К          | К                  | К      | Regex берёт первый segment после node_modules; для pnpm это .pnpm, для scoped package только scope. Ошибка не мешает сегодняшней сборке.                                                  |
| 28  | Inline images 8 KiB                | К          | К                  | К      | maxSize = 256000. Логотип из public не проходит loader и не подтверждает порог imported images.                                                                                           |
| 29  | Stylelint Nunjucks                 | Ч/К        | Ч/К                | Ч/К    | postcss-html override для .njk уже есть, glob команды исключает .njk. Остаётся команда и исправление выявленных нарушений.                                                                |
| 30  | Animate.css                        | К          | К                  | К      | Vue Transition использует animate__ классы, но зависимости и импорта CSS нет.                                                                                                             |
| 31  | Promotion docs                     | К          | К                  | К      | README/quick start отсутствуют. Эти engineering-планы не заменяют пользовательскую STE-документацию.                                                                                      |
| 32  | Showcase / Atomic Design / barrels | Г          | Г                  | Г      | SSR, mock API, state, retry, отмена, nav, mobile и scroll прошли описанные сценарии. Windows dev и start:local дополнительно прошли повторный браузерный smoke; HMR подтверждён на Linux. |
| 33  | Аудит актуальности                 | Г          | Г                  | Г      | Код сверен, три режима запущены, runtime и ограничения записаны. Ожидается ревью результатов.                                                                                             |

## Предлагаемые уточнения перед реализацией

1. Пункт 2: сохранить уже работающий header/genReqId, удалить только ID из сериализуемых данных и nested cached context.
2. Пункт 6: memory snapshot нужен production; свежесть dev/SSR и HMR подтверждена, её не ломаем.
3. Пункт 9: переиспользовать работающую клиентскую отмену; добавить именно серверный жизненный цикл и базовый signal API.
4. Пункт 13: worker нужен production CSS. Pending owner/TTL не переписывать; в dev без CSS-файлов extraction не нужна.
5. Пункт 16: основание уточнено — query ломает route matching. Решение pathname остаётся согласованным; query остаётся в Context.
6. Пункты 17/20: dev assets приходят с WDS и не имеют production content hashes. Проверять этот режим отдельно, не применять ему годовое immutable-кеширование.
7. Пункт 29: сохранить существующий postcss-html override и дополнить только glob/выявленные нарушения.
8. Windows SWC: для инструмента агента использовать отдельный доверенный cache root через SWC_NATIVE_BINDING_CACHE только в окружении запуска. Проверено на dev и start:local. Переустановка зависимостей и изменение глобальных ACL не требуются.

Предлагаемый порядок реализации 1–31 сохраняется, начиная с 22. Новые несогласованные функциональные пункты не добавлены. Полный нагрузочный тест, CPU-профиль PurgeCSS, SIGTERM на долгом SSR и бизнес-redirect fixture здесь не выполнялись; соответствующие проверки выполняются при реализации их пунктов.

## Результаты и коммит

- [HTTP-проверки и наблюдения](./mode-audit-http.json).
- [Fault-проверки assets/readiness/500/redaction](./mode-audit-faults.json).
- [План правок](./fixes.ru.md) и [тест-план](./test-plan.ru.md).

Коммит содержит планы и результаты пункта 33. Исходники, зависимости, Dockerfile и scripts не изменены. Следующий пункт начинается после подтверждения пользователем.
