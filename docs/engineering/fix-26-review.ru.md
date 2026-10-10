# Пункт 26 — нейтральные настройки шаблона

Статус: реализован и проверен 11 октября 2026. Пользователь подтвердил отдельный коммит.

Удалены Umami script и website ID из основного HTML-шаблона. CSP больше не разрешает Umami endpoints и неиспользуемые домены Picsum. В app.vue персональный заголовок заменён на App; страницы продолжают задавать собственные заголовки через Unhead.

Google Fonts и оба preconnect сохранены. Новые настройки аналитики не добавлены. Изменения кода ограничены app.vue, index.njk и helmet.middleware.ts.

## Проверки

| Проверка                                                                                                     | Результат |
| ------------------------------------------------------------------------------------------------------------ | --------- |
| pnpm check: format, types, scripts, styles, knip                                                             | PASS      |
| Свежий dev: 9 маршрутов и локальные JS/CSS assets                                                            | PASS      |
| Свежий start:local: те же HTTP-проверки                                                                      | PASS      |
| Свежая Docker-сборка: те же HTTP-проверки                                                                    | PASS      |
| HTML/CSP: по 5 маршрутов в каждом режиме, включая клиентскую и серверную 404                                 | PASS      |
| BrowserOS neo во всех режимах: hydration, query state, Home → About → Home, чистая консоль                   | PASS      |
| BrowserOS neo во всех режимах: нет Umami/Picsum requests, Google Fonts загружены, CSP violations отсутствуют | PASS      |
| Настоящий SSR renderer: страница без собственного title получает App для en и de                             | PASS      |

В браузере проверены наличие единственного Google Fonts stylesheet, оба preconnect, загрузка IBM Plex Sans и Mono и запросы к fonts.googleapis.com/fonts.gstatic.com. Собственные заголовки страниц после hydration и клиентской навигации сохранены. Проверка default title использовала отдельную сборку с тестовым маршрутом вне репозитория.

Docker image: sha256:a7e1404dbde8bdcf658dab9258f7e8637ca6c0f66af56a8a15cc4f0d2b6c5ffb. Production-проверки использовали отдельный тестовый Redis. Docker-приложение завершилось с exit code 0; тестовые контейнеры удалены. Development оставлен запущенным для ревью.

Fixtures и JSON-результаты находятся вне репозитория в каталоге артефактов текущей задачи. Полный showcase UI QA, проверки HMR и отказов Redis, Piscina и shutdown повторно не выполнялись: этот пункт меняет default title, подключение аналитики и разрешённые CSP-домены.
