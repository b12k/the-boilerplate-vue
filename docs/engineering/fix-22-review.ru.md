# Пункт 22: версия и production-контейнер

Версия читается один раз при загрузке env.ts из package.json. Путь определяется через import.meta.url и одинаков для src и dist. Переменная npm_package_version удалена из схемы окружения. Context продолжает получать env.VERSION; существующие production cache salts используют его при отсутствии override. Общий CACHE_SALT и версия в health относятся к пунктам 3 и 14.

Docker runner использует USER node и CMD ["node", "dist/server/server.js"]. UID = 1000; процесс PID 1 — Node. Пользователь node читает package.json, views, manifests и статические ресурсы.

## Проверки до коммита

| Режим                    | Запуск                                                      | Результат                                                                                 |
| ------------------------ | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Windows development      | pnpm dev в PowerShell с отдельным SWC cache root агента     | PASS: запуск, SSR, hydration, навигация, mock API, mobile, scroll, консоль                |
| Windows local production | pnpm start:local; свежая сборка                             | PASS: сборка и те же HTTP/браузерные сценарии                                             |
| Docker production        | docker build -t codex-bpv-fix22:20261008 .; прямой Node CMD | PASS: сборка, запуск без npm metadata, non-root, чтение assets и HTTP/браузерные сценарии |

- Прямой импорт env из src без npm_package_version и со значением 99.99.99-spoof возвращает версию 0.0.0 из package.json.
- Импорт env из свежего dist проходит те же проверки из корня проекта и другого рабочего каталога. Production salts по умолчанию равны версии.
- Docker стартует без npm_package_version; подмена этой переменной и запуск импорта env из /tmp сохраняют версию 0.0.0.
- Root 302 с Location /en, health 200, /en и /de, About, Lab, Atlas 200; неизвестные маршрут и язык 404. Сериализуемые store и локальные JS/CSS resources доступны.
- BrowserOS neo: counter 6 → 7, getter 12 → 14, сохранение state при навигации, mock failure/retry, Atlas → Relay с обновлением title.
- Отмена запроса при уходе не увеличивает completed count: 1 → 3 после двух завершённых вызовов.
- Home, About, Lab, Atlas и 404 после hydration имеют clientWidth = scrollWidth = 390. Viewport восстановлен после проверки.
- Wheel 400 px → About 0 px → Back 400 px во всех трёх режимах. Браузерная консоль чистая.
- pnpm check: format, scripts, styles, types и knip — PASS. git diff --check — PASS.

## Доставка сигнала и ограничение остановки

Тестовые контейнеры запущены с --stop-timeout 40: внешний бюджет превышает согласованные 30 секунд graceful shutdown.

В отдельном контейнере временный preload зарегистрировал диагностический обработчик SIGTERM. После health 200 docker stop передал сигнал непосредственно Node PID 1; exit code = 143, остановка заняла 310 ms. Диагностический файл находился только в /tmp тестового контейнера.

Штатный Node PID 1 пока не имеет обработчика SIGTERM. Обычный docker stop дождался 40 секунд и завершил процесс SIGKILL: exit code = 137, OOMKilled = false. Это остаётся задачей пункта 10: graceful shutdown нужен до production-релиза. Полный drain в пункте 22 не проверяется.

Тестовые контейнеры удалены; свежий образ сохранён для воспроизведения. Dev восстановлен на localhost:8080 для ревью. Конфигурация приложения и зависимости не содержат SWC workaround: отдельный кеш задан только в окружении процесса агента.
