# Пункт 30 — Animate.css

Статус: реализован и проверен 11 октября 2026. Пользователь подтвердил отдельный коммит.

Добавлена точная зависимость animate.css 4.1.1 и обновлён lockfile. Полный stylesheet импортируется в main.css. Существующие переходы app.vue используют fadeOut и fadeIn в режиме out-in.

Несуществующий класс animate-fastest заменён на animate__faster: длительность каждой анимации — 500 мс. При prefers-reduced-motion библиотека сокращает её до 1 мс. Использованы стандартные настройки [Animate.css](https://animate.style/), без собственных таймеров или CSS-переопределений.

## Проверки

| Проверка                                                                              | Результат |
| ------------------------------------------------------------------------------------- | --------- |
| pnpm check: format, types, scripts, styles, knip                                      | PASS      |
| Frozen install на Windows и в Docker, включая production dependencies                 | PASS      |
| Свежие development-, start:local- и Docker-сборки                                     | PASS      |
| Все три режима: по 9 HTTP-маршрутов, SSR state и доступные локальные JS/CSS assets    | PASS      |
| BrowserOS neo во всех режимах: hydration, query state, Home → About → Home            | PASS      |
| FadeOut и fadeIn имеют duration 500 мс; после перехода одна страница с opacity 1      | PASS      |
| Reduced motion во всех режимах: duration 1 мс, страницы доступны, переход не зависает | PASS      |
| Production CSS содержит используемые классы, keyframes и reduced-motion правило       | PASS      |
| Production: навигация с холодным и прогретым critical CSS-кешем                       | PASS      |
| Браузерные консоли после сценариев во всех режимах                                    | PASS      |

В браузере записаны computed styles при смене transition-классов и события CSS-анимаций. Проверка завершения опирается на конечный DOM: один элемент страницы, opacity 1, временные классы fadeIn/fadeOut удалены. Она не требует полного набора animationend: Vue может удалить выходящий элемент по своему таймеру раньше доставки события в document.

Подключение всей библиотеки увеличивает полный production stylesheet с 30042 до 54113 байт: +24071 байт до HTTP-сжатия. Это сохраняет все готовые анимации для разработки проекта. Производительность и размер сжатого ответа отдельно не измерялись.

Docker image: sha256:faa9c25c8ffef68ea7dca2474f7b30808be67e8aff67cc25e35ab70d7ab03b95. Production-проверки использовали отдельный Redis; контейнер приложения завершился с exit code 0. Тестовые контейнеры удалены. Development оставлен запущенным для ревью.

Снимок страницы получить не удалось: BrowserOS neo дважды вернул CDP timeout для Page.captureScreenshot, в том числе после активации собственной тестовой вкладки. Viewport восстановлен. Проверки DOM, CSS-анимаций, reduced motion и консоли прошли; проверку изображения по пикселям не заявляем.

При первой установке без SWC_NATIVE_BINDING_CACHE postinstall показал существующую Windows-ошибку проверки прав cache directory. Последующие сборки использовали ранее настроенный рабочий cache directory и прошли. Frozen install выполнен с ignore-scripts, как в Dockerfile.

Fixtures, browser helper и JSON-результаты находятся вне репозитория в каталоге артефактов текущей задачи. Полный showcase QA и проверки отказов Redis, Piscina и shutdown повторно не выполнялись.
