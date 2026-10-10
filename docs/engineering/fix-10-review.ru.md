# Пункт 10: graceful shutdown

База: 949d14a. Статус: реализовано, проверено и подтверждено пользователем 10 октября 2026 для отдельного коммита.

## Изменение

installGracefulShutdown вынесен в utility. Первый SIGTERM или SIGINT переводит сервер в draining и запускает закрытие HTTP listener. Повторные сигналы не запускают второе закрытие. Новые запросы на сохранившихся соединениях получают 503; /health возвращает ready=false и status=DRAINING.

Общий SHUTDOWN_BUDGET_MS по умолчанию равен 30000. После завершения HTTP ждём отслеживаемые SSR и фоновые задачи, затем закрываем Redis. Отслеживается и исходный Promise рендера: HTTP timeout или отключение клиента сами по себе не означают завершение вычислений. Запись render/CSS после отправки ответа и очистка pending входят в drain.

При успешном завершении процесс выходит с кодом 0. При превышении бюджета или ошибке закрытия закрываем HTTP-соединения и Redis принудительно, логируем причину и завершаем процесс с кодом 1. Таймер остаётся активным, чтобы незавершённый Promise без собственного I/O не позволил процессу выйти раньше бюджета.

Redis close прекращает retries и текущий handshake; destroy немедленно закрывает доступный сокет. Отдельный connect-handler закрывает сокет, который стал доступен после timeout/destroy. Это устраняет обнаруженную гонку старта: ошибка загрузки SSR assets больше не оставляет процесс с открытым Redis-соединением.

До открытия listener вызывается loadSsrAssets и в development, и в production. Ручной проверки формы manifest нет. /health отвечает 200 только после открытия listener; недоступность Redis не снимает готовность SSR. Отдельных /ready или /version нет.

Настройка добавлена в env-defaults.ts и env-schema.ts. В .env.example и локальном .env она приведена как закомментированный пример.

## Проверки

pnpm check и git diff --check проходят. Тестовый framework, CI и зависимости не добавлены.

| Режим            | Проверки                                                                                            |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| pnpm dev         | 9 HTTP-маршрутов и ассеты; hydration; home → about → home; query; /health ready; console neo чистая |
| pnpm start:local | Свежая production-сборка; те же HTTP/browser проверки; console neo чистая                           |
| Docker           | Свежий codex-bpv-shutdown:20261010; те же HTTP/browser проверки; console neo чистая                 |

В отдельном Docker-окружении пройдены девять сценариев:

1. SIGTERM во время SSR: активный ответ 200 завершается; новое соединение не обслуживается; exit 0.
2. SIGINT после отправки HTML во время фонового CSS, затем SIGTERM: один shutdown; результат CSS записан до закрытия Redis; exit 0.
3. Активный HTTP дольше shutdown budget 250 мс: соединение принудительно закрыто; SHUTDOWN_TIMEOUT; exit 1.
4. Зависший фоновый CSS после ответа 200: SHUTDOWN_TIMEOUT; exit 1.
5. SSR response budget 250 мс: ответ 500, но shutdown ждёт завершения исходного renderer Promise; exit 0.
6. Недоступный Redis с 50 retries: SSR 200 и ready=true; retries отменены; exit 0 примерно за 0.5 секунды.
7. Docker stop с внешним grace period 35 секунд: фоновый CSS завершается; exit 0.
8. Отсутствующий SSR bundle: listener не открывается; exit 1; позднее Redis-подключение не удерживает процесс.
9. HTTP pipeline по уже открытому соединению во время drain: /health отвечает 503, ready=false, status=DRAINING; активный SSR завершается; exit 0.

Отдельный TCP peer проверяет close и destroy в двух состояниях: handshake уже начат и connect только вызван. Все четыре проверки подтверждают закрытие сокета, отмену подключения и отсутствие повторной попытки через 1100 мс.

В source и dist проверены SHUTDOWN_BUDGET_MS: default 30000, override 250; значения 0, -1, 1.5, text и пустая строка отклонены.

Профильные сценарии используют временно смонтированные renderer/CSS fixtures, включая Promise, который намеренно игнорирует AbortSignal. Они проверяют lifecycle сервера; производственный алгоритм PurgeCSS ими не заменён в итоговых smoke. Fixtures и результаты находятся вне репозитория; Redis для проверок отдельный.

## Границы

Piscina ещё не добавлен. В пункте 13 его штатное завершение вставляется перед cacheService.close, принудительное — перед cacheService.destroy; порядок проверяется вместе с пулом.

Версия, Cache-Control и точный HTTP-контракт /health относятся к следующим согласованным пунктам. В этой правке добавлено состояние готовности.

Таймер shutdown не прерывает синхронный JavaScript, блокирующий event loop. Внешний grace period контейнера должен оставлять приложению время на его 30-секундный drain; принудительная остановка контейнера остаётся внешним пределом.

Артефакты: shutdown-results-10.json, redis-shutdown-results-10.json, shutdown-env-10-{source,dist}.json, shutdown-browser-10.json и recheck-fix-10-{dev,local,docker}.json. Скрипты check-shutdown-10.mjs, check-redis-shutdown-10.mjs и check-shutdown-env-10.mjs сохранены вне репозитория.
