# Пункт 27 — имена vendor-пакетов

Статус: реализован и проверен 11 октября 2026. Пользователь подтвердил отдельный коммит.

getVendorName нормализует Windows separators и извлекает полное имя пакета после последнего node_modules. Для pnpm это пакет внутри virtual store, а не .pnpm. Scoped-имя сохраняется целиком: @vue/shared и @vue/runtime-core дают разные результаты. Для отсутствующего context и путей вне node_modules сохранён fallback other.

Изменение кода ограничено rspack/utils.ts. Правила splitChunks и шаблоны имён файлов не менялись. Повторяющиеся node_modules в virtual store соответствуют [структуре pnpm](https://pnpm.io/symlinked-node-modules-structure).

## Проверки

| Проверка                                                                                                        | Результат |
| --------------------------------------------------------------------------------------------------------------- | --------- |
| pnpm check: format, types, scripts, styles, knip                                                                | PASS      |
| 17 случаев: обычные, scoped, pnpm, вложенные пакеты, Windows/Linux separators и fallback                        | PASS      |
| 6 реальных установленных пакетов: vue, axios, @vue/shared, @vue/runtime-core, @unhead/vue, es-toolkit           | PASS      |
| Production Rspack: имена scoped-чанков и уникальность vendor-файлов                                             | PASS      |
| Свежий dev: 9 HTTP-маршрутов и локальные assets                                                                 | PASS      |
| Свежий start:local: те же HTTP-проверки; все 17 JS/CSS-ресурсов manifest доступны                               | PASS      |
| Свежая Docker-сборка: те же HTTP-проверки; все 17 JS/CSS-ресурсов manifest доступны                             | PASS      |
| BrowserOS neo во всех режимах: hydration, query state, Home → About → Home, Lab, Atlas → Relay и чистая консоль | PASS      |

Сборка выпускает отдельные именованные чанки @vue/shared, @vue/reactivity, @vue/runtime-core и @vue/runtime-dom. У них разные content hash и файлы. Чанков с именами .pnpm или только @vue нет.

При текущей конфигурации выпускаются 9 vendor JS-файлов. Разделение бывшей общей группы увеличивает количество HTTP-запросов за vendor-ресурсами. Производительность этого разделения под нагрузкой отдельно не измерялась; настройки размеров и количества чанков в этом пункте не менялись.

Docker image: sha256:89efe1315ce4ece5f8a348934e13f5e066597edd02faa781f5d472dc02730a37. Production-проверки использовали отдельный тестовый Redis. Docker-приложение завершилось с exit code 0; тестовые контейнеры удалены. Development оставлен запущенным для ревью.

Fixtures и JSON-результаты находятся вне репозитория в каталоге артефактов текущей задачи. Полный showcase UI QA, HMR и проверки отказов Redis, Piscina и shutdown повторно не выполнялись: этот пункт меняет извлечение имени vendor-пакета в production-сборке.
