# Пункт 14: GET /health

База: 5a0affd. Статус: реализовано, проверено и подтверждено пользователем 10 октября 2026 для отдельного коммита.

## Изменение

/health возвращает JSON с ready, status, uptime и version. Версия берётся из общего env.VERSION, который читается из package.json. Ответы 200 и 503 содержат Cache-Control: no-store. Состояния готовности из graceful shutdown сохранены: OK — 200, STARTING/DRAINING — 503.

Маршрут зарегистрирован через app.get вместо app.use: вложенные пути и остальные HTTP-методы больше не обслуживаются как health. Стандартные query и trailing slash разрешены. Автоматический HEAD от Express сохранён; отдельного обработчика нет. /ready и /version не добавлены.

Health остаётся перед SSR/context middleware. Он не проверяет Redis и не вызывает renderer. Недоступность кеша не снимает готовность работающего SSR. Правило выполнения пунктов также уточнено по запросу пользователя: после подтверждения коммита сразу начинаем следующий пункт.

## Проверки

pnpm check и git diff --check проходят. Новые зависимости, framework и CI не добавлены.

| Режим            | Проверки                                                                                                                    |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------- |
| pnpm dev         | 9 HTTP-маршрутов и ассеты; health JSON/version/no-store; routing; hydration, query, home → about → home; console neo чистая |
| pnpm start:local | Свежая production-сборка; те же HTTP/browser проверки с отдельным доступным Redis; console neo чистая                       |
| Docker           | Свежая сборка codex-bpv-health:20261010; те же HTTP/browser проверки с отдельным доступным Redis; console neo чистая        |

Во всех режимах /health возвращает текущую версию 0.0.0 из package.json, ready=true, status=OK, целочисленный uptime, JSON Content-Type и no-store; ETag отсутствует. /health?probe=1 и /health/ сохраняют этот контракт. /health/nested, /ready, /version и POST/PUT/PATCH/DELETE /health на готовом сервере возвращают 404. HEAD /health возвращает 200, no-store и пустое тело.

Настоящий health middleware проверен через временный HTTP-сервер для source, local dist и Docker dist: STARTING/OK/DRAINING возвращают соответственно 503/200/503, правильную готовность, версию и no-store.

В отдельном Docker выполнены профильные проверки:

- Двадцать /health с подключённым Redis: commandstats не изменились, renderer не вызван. Контрольный SSR вызвал специально падающий renderer fixture и получил ожидаемый 500; следующий health снова вернул 200.
- Недоступный Redis: SSR 200, /health 200 и ready=true, версия и no-store сохранены; остановка завершилась с exit 0.
- SIGTERM во время активного SSR: следующий /health по тому же HTTP-соединению вернул 503, ready=false, status=DRAINING, version=0.0.0 и no-store; сервер завершился с exit 0.

Внешние fixtures и JSON-результаты находятся вне репозитория. Стартующий сервер ещё не открывает listener; состояние STARTING проверено отдельным HTTP-harness. Draining дополнительно проверен на настоящем сервере. Новое соединение после закрытия listener может быть отклонено вместо ответа 503.

## Ограничения окружения

В локальном development Redis на порту 6379 был недоступен. Сервер залогировал исчерпание retries и продолжил SSR без кеша; health и браузерные проверки прошли. Local production и Docker проверены с отдельным доступным тестовым Redis. Пользовательский Redis не изменяли.

На Windows применяется прежний SWC_NATIVE_BINDING_CACHE; Node выдаёт известное предупреждение deprecated module.register. Это не ошибка запуска. Полный повтор сценариев Piscina и shutdown не выполнялся: в этом пункте изменены только HTTP-контракт health и регистрация маршрута.
