# Пункт 24 — Unhead управляет метаданными

Статус: реализован и проверен 11 октября 2026. Пользователь подтвердил отдельный коммит.

app.vue читает lang из стора context и передаёт его реактивным getter в useHead. Основной Nunjucks-шаблон использует htmlAttrs и headTags, подготовленные Unhead; ручные lang, charset и viewport удалены. Стандартные charset=utf-8 и viewport=width=device-width, initial-scale=1 уже добавляет серверный createHead.

В независимых шаблонах 500 и debug viewport заменён на width=device-width, initial-scale=1. Ограничения user-scalable, maximum-scale и minimum-scale удалены. Google Fonts и preconnect сохранены.

## Проверки

| Проверка                                                                                                                | Результат |
| ----------------------------------------------------------------------------------------------------------------------- | --------- |
| pnpm check: format, types, scripts, styles, knip                                                                        | PASS      |
| Свежий dev: 9 маршрутов и assets; 10 проверок raw SSR head, включая render-cache hit                                    | PASS      |
| Свежий start:local: те же HTTP-проверки                                                                                 | PASS      |
| Свежая Docker-сборка: те же HTTP-проверки                                                                               | PASS      |
| BrowserOS neo во всех режимах: hydration, query state, home → about → home, отсутствие дублей и чистая консоль          | PASS      |
| BrowserOS neo во всех режимах: реактивное изменение store.lang en → de → en; реальный переход по Change language на /de | PASS      |
| Независимые 500/debug: 2 проверки raw head и browser на ширине 390px, debug viewer работает                             | PASS      |

Raw SSR проверен для английских и немецких страниц Home, About, Lab, Project и клиентской 404. В ответах ровно один lang с правильным значением, один charset и один viewport. Два последних запроса подтверждены как render-cache hit. Google Fonts присутствуют в одном экземпляре.

После hydration теги также остаются в одном экземпляре. При изменении context store обновляется document.documentElement.lang; тестовое изменение восстановлено. Текущий переключатель языка — обычная ссылка с полной навигацией. Переход на /de создаёт новый контекст с lang=de и соответствующий html.lang; автоматическое изменение стора от Vue Router не предполагается.

500/debug сохраняют собственный head. На мобильной ширине clientWidth=390, viewport не запрещает масштабирование; размеры жеста pinch отдельно не измерялись. Параметры viewport тестовой вкладки восстановлены. Серверный fallback 404 не менялся: в нём не было ограничений масштаба.

Docker image: sha256:1e80e92c76807b53521d4eaca01e41e03f05d0decaf9f5601283fa2666455e1d. Production использовал отдельный тестовый Redis. Fixtures и результаты находятся вне репозитория; тестовые контейнеры удалены, серверы завершились с exit code 0. Development оставлен запущенным для ревью.

Изменены только app.vue и три Nunjucks-шаблона. Полный showcase UI QA, HMR и профильные проверки отказов Redis, Piscina и shutdown повторно не выполнялись. Title и аналитика остаются для пункта 26.
