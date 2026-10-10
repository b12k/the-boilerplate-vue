# Пункт 17: ресурсы текущей SSR-страницы

База: 609102b. Статус: реализовано, проверено и подтверждено пользователем 10 октября 2026 для отдельного коммита.

## Изменение

SSR-only loader оборачивает скомпилированные .vue-компоненты и регистрирует их идентификаторы через useSSRContext. Исходный SFC не меняется: серверные и клиентские scoped CSS hashes совпадают. Оригинальный setup, включая async setup, и именованные экспорты сохраняются. Loader экспортирует только pitch: Rspack поддерживает отсутствие normal-функции, а pitch всегда возвращает обёртку. Inline loader requests остаются внутри серверной сборки. Путь loader вычисляется непосредственно в его настройке.

Server entry передаёт отдельный SSR context в renderToString. Массив modules входит в RenderResult и Redis render-cache; в Pinia и window.INITIAL_STATE его нет. Регистрации объединяются Set для каждого рендера.

Клиентский manifest содержит сопоставление идентификаторов компонентов с CSS/JS. Ресурсы берутся из chunk graph и chunk groups сборщика, включая статические зависимости и порядок файлов группы. Общие модули приложения выделяются в shared chunk. Для общего чанка не добавляем соседние чанки всех маршрутов, которым он принадлежит.

getPageAssets объединяет initial и ресурсы использованных компонентов, сохраняя порядок и удаляя повторы. Один набор используется Nunjucks-шаблоном и генератором critical CSS. Шаблон подключает initial и текущие JS через defer; остальные маршруты загружаются при навигации. Blanket prefetch всех async CSS/JS удалён.

Без готового critical CSS подключаются обычные stylesheet текущей страницы. При готовом critical CSS полный набор CSS подключается через существующий preload/data-async-css механизм. Noscript содержит полные стили этой же страницы.

Inline-блок с INITIAL_STATE и переключением preload → stylesheet расположен перед закрывающим body. SSR-разметка разбирается до выполнения этого блока; клиентское состояние доступно до запуска deferred JS. Critical CSS, preload, noscript и deferred JS остаются в head.

## Проверки

pnpm check и git diff --check проходят. Новых зависимостей, тестовой инфраструктуры и CI нет.

После упрощения loader повторены pnpm check, свежие dev/start:local/Docker, HTTP и browser smoke. Local и Docker дополнительно проверяют регистрацию modules, render-cache hit, состав ресурсов и CSS fallback. Консоли neo чистые. Артефакты этой проверки: recheck-fix-17-review-{dev,local,docker}.json и fix-17-assets-{local-review,docker-review}.json.

После переноса inline-блока повторён smoke всех трёх режимов и CSS fallback в local/Docker. Browser probe при присваивании INITIAL_STATE фиксирует существующую SSR-разметку и отсутствие начавшейся hydration; после запуска клиента preload-ссылки стали stylesheet. Проверки без JavaScript подтверждают noscript fallback в production. Артефакты: recheck-fix-17-inline-{dev,local,docker}.json и fix-17-assets-{local-inline,docker-inline}.json.

| Режим            | Итоговый код после удаления fixtures                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------ |
| pnpm dev         | 9 HTTP-маршрутов и их ассеты; hydration; home → about → home; query сохраняется; console neo без ошибок и предупреждений |
| pnpm start:local | Свежая production-сборка; тот же smoke; проверены состав ресурсов, render-cache hit и CSS fallback; console чистая       |
| Docker           | Свежий codex-bpv-page-assets:20261010; тот же HTTP/browser smoke и профильные проверки; console чистая                   |

Дополнительно временные fixtures добавляли отдельный scoped CSS для Home и About, общий компонент со стилями и defineAsyncComponent с собственными CSS/JS. Их исходники восстановлены перед итоговыми сборками. Fixture-скрипт и результаты находятся вне репозитория.

В local production и отдельном Docker fixture-образе проверено:

- HTML Home содержит initial + Home + shared + lazy; CSS/JS About отсутствуют. Для About проверяется обратное. Порядок CSS соответствует initial, shared, page, lazy; повторов нет.
- Все указанные ресурсы отвечают 200. Browser resource timing подтверждает, что уникальные CSS/JS About появляются после навигации с Home.
- Redis render-cache хранит идентификаторы страницы и ленивого компонента; повторный ответ сохраняет нужные ресурсы. Pinia не содержит этих идентификаторов.
- Critical CSS miss, hit, pending и выключенный кеш сохраняют полные стили страницы. При pending расчёт не требуется для корректного ответа.
- При выключенном JavaScript Home и About в local/Docker сохраняют scoped, shared и lazy стили: computed CSS properties совпадают с ожидаемыми значениями, hydration отсутствует. Проверены готовый critical CSS и отсутствие critical CSS; noscript содержит четыре нужных stylesheet.
- После восстановления JavaScript hydration и клиентская навигация работают; консоли чистые.

## Контракт и ограничения

Development сохраняет vue-style-loader и lazy compilation: стили добавляются JavaScript. Проверки SSR-стилей без JavaScript относятся к production, где CSS извлекается в отдельные файлы.

Автоматическая регистрация настроена для .vue-компонентов. Build identifiers нормализуют разделители Windows/Linux и используют пути относительно корня проекта.

Изменяется форма RenderResult. Как согласовано для CACHE_SALT, новый релиз должен иметь новую версию package.json: старые render-cache записи тогда находятся в другом namespace. Проверки используют отдельный тестовый Redis; пользовательский production-кеш не очищается.

Существующее предупреждение DEP0205 относится к SWC register. Dev запущен со ранее согласованным SWC_NATIVE_BINDING_CACHE. Старые HMR disconnect сообщения вкладок после смены режима не относятся к production smoke; итоговые проверки выполнялись в свежих вкладках.

Артефакты: fixture-assets-17.mjs, check-page-assets-17.mjs, fix-17-assets-{local,docker,local-fixture,docker-fixture}.json, recheck-fix-17-*.json, fix17-noscript-both.json, fix17-browser-docker-fixture.json и fix17-browser-final.json. Временные тестовые контейнеры удалены, dev оставлен работающим.
