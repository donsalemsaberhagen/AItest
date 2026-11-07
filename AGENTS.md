# uCoz AI — стек для создания нового сайта

Официальные источники: [MCP](https://www.ucoz.ru/ai/mcp) · [Skills](https://www.ucoz.ru/ai/skills) · [Cursor setup](https://www.ucoz.ru/help/razrabotka-api/podklyuchenie-ucoz-mcp-k-cursor) · [AI-контент](https://www.ucoz.ru/ai/content) · [AI Code](https://www.ucoz.ru/help/aicode/chto-takoe-ai-code-i-kak-im-polzovatsya)

## Что установлено

| Компонент | Где | Статус |
|-----------|-----|--------|
| Remote MCP `ucoz-mcp` | `.mcp.json`, `.cursor/mcp.json` → `https://www.ucoz.com/mcp` (эквивалент `https://www.ucoz.ru/mcp`) | Подключён, OAuth |
| 9 agent skills | `.cursor/skills/` и `~/.cursor/skills/` | Установлены |
| Cursor plugin manifest | `.cursor-plugin/plugin.json` | Установлен |
| Higgsfield MCP | `.mcp.json` + `.cursor/plugins/higgsfield/` | **Подключён** (`namespaceStatus: ready`). Demo: Ads Studio brand research for `topmanshopworld.clan.su` (`brand_id` ac3ae229-…) |
| Refero MCP | `.mcp.json` → `https://api.refero.design/mcp` + `.cursor/plugins/refero/` | Сконфигурирован; OAuth при первом подключении (платный план для live research) |
| Refero skill | `.cursor/skills/refero-design/` + `.agents/skills/refero-design/` (`npx skills add`) | Установлен |
| UI UX Pro Max (uupm.cc) | `.cursor/skills/{ui-ux-pro-max,design,design-system,ui-styling,brand,banner-design,slides}/` | Установлен через `uipro init --ai cursor` — **это skill, не MCP** |

## AI Code vs MCP (важно)

| | **AI Code** (панель uCoz) | **uCoz MCP** (Cursor) |
|--|---------------------------|------------------------|
| Где | Управление дизайном → кнопка AI Code | IDE / агент через `ucoz-mcp` |
| Что делает | HTML/CSS/JS правки **открытого** шаблона | Сайты, модули, шаблоны, контент, файлы, магазин… |
| Картинки | Не генерирует; принимает до 5 референсов | Через skills + внешние MCP (Fal / Higgsfield) |
| PHP/Python | Нет | Да, через `apps_*` / server-scripts skill |
| Тариф | Оптимальный / Магазин / Максимальный, 100 запросов/мес | MCP на любом тарифе, включая бесплатный |

AI Code **не является MCP** и в Cursor не ставится. Для агента используем MCP + skills.

## Формат MCP-конфига (как в Cursor plugins)

Образец из [cursor/plugins …/github/mcp.json](https://github.com/cursor/plugins/blob/ae5650febf4320793844c12c4adaa937f417f8da/third_party/github/mcp.json): `type: "http"` + `url` (+ опционально `headers` с секретами). Для uCoz/Higgsfield API-ключ не нужен — OAuth в браузере.

Higgsfield (`https://mcp.higgsfield.ai/mcp`): Marketplace → Add → Sign in, либо вручную в `mcp.json`. Нужна **платная** подписка Higgsfield.

Refero (`https://api.refero.design/mcp`): skill + read-only MCP (styles / screens / flows). Установка: `npx skills add https://github.com/referodesign/refero_skill --skill refero-design`. Live research — OAuth + платный план Refero; craft-references работают без аккаунта.

UI UX Pro Max ([uupm.cc](https://uupm.cc/#styles)): CLI `uipro` / пакет `ui-ux-pro-max-cli`. Это **не MCP** — локальные skills + поиск стилей через скрипты в `ui-ux-pro-max`. Установка: `uipro init --ai cursor` (проект) и опционально `--global`.

## MCP-инструменты (создание сайта)

1. `list_sites` / `create_site` / `select_site` — аккаунт и выбор сайта  
2. `modules_*` — установка модулей  
3. `tmaker_*` + `templates_*` — каркас и шаблоны всего сайта  
4. `content_*` — материалы (новости, блог, статьи, …)  
5. `files_*` / `ftp_*` — файлы и ассеты  
6. `shop_*`, `users_*`, `subscriptions_*`, `apps_*` — по необходимости  
7. `skills_tool` — каталог/resolve/register_usage скиллов  

Деструктивные действия требуют `confirm: true` от пользователя.

## Skills для нового сайта с нуля

| Порядок | Skill | Задача |
|---------|-------|--------|
| 1 | `ucoz-template-creator-skill` | Оригинальный шаблон всего сайта (framework + CSS + модули) |
| 2 | `ucoz-landing-skill` | Главная / лендинг |
| 3 | `ucoz-content-manager-skill` | Наполнение модулей, SEO, категории, обложки |
| 4 | `ucoz-design-editor-skill` | Доработка дизайна/CSS без полной пересборки |
| 5 | `ucoz-popup-design-skill` | Системные окна и toasts |
| опц. | `ucoz-shop-optimizer-skill` | Интернет-магазин |
| опц. | `ucoz-server-scripts-skill` | PHP/Node/Python backend |
| опц. | `ucoz-site-translator-skill` | Локализация |
| опц. | `ucoz-ad-campaign-landing-skill` | Рекламные лендинги + UTM |

Перед работой: `skills_tool(action="resolve", task=…)` → читать `SKILL.md` найденного скилла.

## AI-контент в панели vs MCP

- **AI-генерация контента** ([/ai/content](https://www.ucoz.ru/ai/content)) — встроенный инструмент панели управления (новости, блог, publ, load, board). Включается в «Инструменты → AI-генерация контента». Это не MCP-скилл.  
- **MCP + skills** — внешний агент (Cursor) управляет сайтом через API. Для контента через агента используй `ucoz-content-manager-skill`.

## Типовой сценарий «новый сайт»

1. Уточнить нишу, язык, модули, домен/зону (`create_site`: `addr` + `dom`).  
2. `create_site` → сайт сразу становится активным (или `list_sites` + `select_site`).  
3. `modules_write` — нужные модули + uAPI.  
4. Читать и следовать `ucoz-template-creator-skill` (каркас → CSS → validate → publish с подтверждением).  
5. Лендинг главной — `ucoz-landing-skill`.  
6. Контент — `ucoz-content-manager-skill`.  
7. Попапы — `ucoz-popup-design-skill`.  
8. После успешной работы: `skills_tool(action="register_usage", skill_id=…)`.

Не публиковать каркас и не менять продакшен без явного подтверждения владельца.
