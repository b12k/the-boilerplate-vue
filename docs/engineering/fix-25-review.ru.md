# Пункт 25 — HTTP redirects из Vue Router

Статус: реализован и проверен 11 октября 2026. Пользователь подтвердил отдельный коммит.

После начальной навигации server.entry читает redirectedFrom.meta.responseCode ?? 302. Для HTTP-кодов 301/302/303/307/308 возвращает router.resolve(currentRoute.fullPath).href с языковым base, без execRoutePreFetch и renderToString. Middleware отправляет redirect через Express до подготовки page assets, critical CSS, шаблона и сериализации state. Запись redirect в render-cache не запускается; захваченный pending удаляется фоновой задачей.

Используется существующий meta.responseCode. У CatchNotFound явно задан 404: переход на клиентскую страницу /404 продолжает отдавать HTTP 404 и сохраняет возможность навигации. Самостоятельный /404 и серверный fallback также сохранены. Общая небольшая утилита определяет пять redirect-кодов; 304 проходит обычную ветку.

## Проверки

| Проверка                                                                                                                 | Результат |
| ------------------------------------------------------------------------------------------------------------------------ | --------- |
| pnpm check: format, types, scripts, styles, knip                                                                         | PASS      |
| Свежий dev: 9 маршрутов и локальные assets                                                                               | PASS      |
| Свежий start:local: те же HTTP-проверки                                                                                  | PASS      |
| Свежая Docker-сборка: те же HTTP-проверки                                                                                | PASS      |
| BrowserOS neo во всех режимах: hydration, query state, home → about → home, чистая консоль                               | PASS      |
| BrowserOS neo во всех режимах: клиентский redirect с query/hash; возврат с 404 в Overview                                | PASS      |
| Production-профиль: 33 HTTP-запроса с изолированными маршрутами и настоящим Redis                                        | PASS      |
| Настоящий SSR renderer: 16 проверок статуса, полного адреса, query/hash, пустых html/modules и отсутствия prefetch state | PASS      |
| BrowserOS neo: HTTP redirect → About, hydration и совпадение конечного пути/query с CSR                                  | PASS      |

HTTP-профиль проверяет en/de, GET и автоматический HEAD для всех пяти кодов, 302 по умолчанию при responseCode=200 у цели, сохранение повторяющихся query-параметров и цепочку с конечным адресом и кодом исходного маршрута. Проверены no-store, текущий X-Request-ID, X-Response-Time и отсутствие SSR HTML/cache-hit headers в redirect-ответе.

Для целевого тестового компонента prefetch и render выбрасывают ошибки при вызове: redirect-ответы проходят без этих вызовов. Инструментация настоящего CacheService подтверждает отсутствие чтения CSS, CSS pending и записи render-result. Корневой тестовый маршрут действительно захватывает Redis pending; после redirect ключ удалён, следующий запрос захватывает его заново. Положительные контрольные страницы вызывают обычные prefetch/render/CSS ветки. 304 не получает Location; явные 200/404 и клиентская/серверная 404 работают как прежде.

Fixtures и результаты находятся вне репозитория. Production-профиль использует renderer, собранный из текущего SSR entry с добавленными тестовыми маршрутами; код приложения не подменён заглушкой renderer. Vue Router по-прежнему разрешает компоненты при начальной навигации; пропускаются наш prefetch и рендер HTML. Полная матрица UI, отказов Redis, Piscina и shutdown не повторялась.

Дополнительно обнаружено существующее поведение начальной hydration: createApp делает router.push(context.url), поэтому fragment исходного URL сбрасывается. Это воспроизведено и при обычной загрузке /about?foo=25#proof. Сам HTTP redirect до запуска JavaScript сохраняет fragment; CSR-переходы и router.resolve также сохраняют его. Исправление начальной hydration в этот пункт не включено. Отключение JavaScript в отдельной тестовой вкладке восстановлено.

Docker image: sha256:0655b6d7a716ef286384003612590c4bc0a20ad9ee7c74ce05fda90d87f06209. Тестовые контейнеры удалены; серверные Docker-контейнеры завершились с exit code 0. Пользовательский Redis не очищался. Development оставлен запущенным для ревью.

Справка: [Vue Router — Redirect and Alias](https://router.vuejs.org/guide/essentials/redirect-and-alias.html).
