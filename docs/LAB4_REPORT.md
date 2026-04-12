# Отчет по лабораторной работе №4
## «Интеграция, инференс, мониторинг и контейнеризация ML-сервиса»

**Студент:** Чумакова Лада Александровна
**Группа:** БВТ2202

---

### 1. Цель работы
Завершить создание рабочего ML-сервиса, включая разработку инференс-модуля, интеграцию компонентов, внедрение мониторинга и контейнеризацию всей системы.

### 2. Результаты выполнения по шагам

#### Шаг 1. Разработка инференс-модуля
Разработан инференс-модуль на базе FastAPI, включающий в себя:
- **NER (Named Entity Recognition)**: Извлечение метаданных (название, авторы, год, журнал, DOI) из текста статьи. Используется модель на базе BERT/RoBERTa, загруженная из локальной директории `models/ner/final`.
- **Summarization**: Генерация краткой аннотации (до 100 слов) и развернутого реферата (до 1000 слов). Используется модель `cointegrated/rut5-small`.
- Логика инференса реализована в классе `MLService` в файле `backend/app/ml.py`.
- Реализованы эндпоинты в `backend/app/routers/ml.py`:
    - `POST /ml/extract-metadata`: извлечение метаданных из текста.
    - `POST /ml/extract-from-pdf`: извлечение метаданных напрямую из PDF-файла.
    - `POST /ml/summarize`: генерация реферата по ID статьи (с загрузкой PDF из S3).

#### Шаг 2. Интеграция компонентов
Все модули объединены в единую экосистему:
- **Frontend**: React-приложение взаимодействует с бэкендом через `frontend/src/app/utils/api.ts`.
- **Storage**: PDF-файлы сохраняются в S3-совместимое хранилище (MinIO).
- **Database**: PostgreSQL хранит метаданные статей, цитаты и теги (связь Many-to-Many).
- **Auth**: Реализована JWT-авторизация для защиты API и разграничения доступа к статьям.

#### Шаг 3. Мониторинг: логи, метрики Prometheus, системные показатели, Grafana

**Логирование** настроено в `backend/app/main.py`: входящие запросы проходят через middleware и пишутся в лог; ошибки валидации и исключения обрабатываются отдельными обработчиками. Дублирующая запись ведётся в файл `backend.log` (рабочий каталог процесса бэкенда).

**Эндпоинт `/system/stats`** (тот же `main.py`) возвращает снимок нагрузки на хост и процесс через `psutil`: CPU, RAM, диск, аптайм процесса, число потоков. На фронтенде страница «Мониторинг системы» периодически опрашивает этот API и показывает карточки с прогресс-барами (удобно для быстрой проверки без Prometheus).

**Цепочка метрик Prometheus**

1. Бэкенд отдаёт **текстовый exposition-формат** на `GET /metrics` (это не JSON и не HTML-дашборд приложения — так устроен стандарт Prometheus).
2. Контейнер **Prometheus** (`prometheus/prometheus.yml`) с интервалом **10 с** опрашивает target `backend:8080` по пути `/metrics` и хранит временные ряды.
3. Контейнер **Grafana** подключается к Prometheus по сети Docker (`http://prometheus:9090`), datasource и стартовый дашборд подхватываются из provisioning при старте.

**Какие метрики собираются**

*Прикладные метрики префикса `app_*`* (счётчики и gauge, обновляются в HTTP-middleware; запросы к `/metrics`, `/docs`, `/openapi.json`, `/redoc` **не учитываются**, чтобы скрейп не искажал нагрузку). Реализация: `backend/app/prometheus_app_metrics.py`, подключение middleware — `backend/app/main.py`.

| Метрика | Тип | Описание |
|--------|-----|----------|
| `app_requests_total` | Counter | Число обработанных HTTP-запросов (учитываемых middleware). |
| `app_request_errors_total` | Counter | Число ответов с кодом **5xx**. |
| `app_response_time_avg_ms` | Gauge | Средняя задержка ответа в миллисекундах с момента старта процесса. |
| `app_response_time_max_ms` | Gauge | Максимальная задержка (мс) с момента старта процесса. |
| `app_rps_current` | Gauge | Сколько запросов пришло в **текущую календарную секунду**. |
| `app_rps_avg` | Gauge | Средний RPS с момента старта процесса. |
| `app_rps_peak` | Gauge | Максимальный RPS по **уже завершённым** секундам. |
| `app_response_time_slo_ms` | Gauge | Целевой порог задержки (SLO), по умолчанию **1000** мс; можно переопределить переменной окружения `APP_RESPONSE_TIME_SLO_MS`. |

*Стандартные HTTP-метрики пакета `prometheus-fastapi-instrumentator`* (дополняют картину по маршрутам и длительностям): в том числе `http_requests_total`, `http_request_duration_seconds`, `http_request_duration_highr_seconds`, `http_request_size_bytes`, `http_response_size_bytes`, `http_requests_inprogress` и служебные метрики процесса/Python. Настройка: `Instrumentator` в `backend/app/main.py`, публикация на `/metrics` при старте приложения.

**Где смотреть в браузере**

| Сервис | URL | Назначение |
|--------|-----|------------|
| Prometheus UI | http://localhost:9090 | Вкладка **Graph**, запросы PromQL, статус target **Status → Targets**. |
| Grafana | http://localhost:3000 | Дашборды и визуализация. После первого входа: логин/пароль задаются переменными `GRAFANA_ADMIN_USER` и `GRAFANA_ADMIN_PASSWORD` (по умолчанию в compose: **admin** / **admin** — в продакшене обязательно сменить). |
| Сырой scrape | http://localhost:8080/metrics | Просмотр того, что реально отдаёт приложение (текст Prometheus). |

**Grafana: что уже настроено**

- Datasource: `grafana/provisioning/datasources/prometheus.yml` (Prometheus по умолчанию).
- Дашборд **«Lab4 — Backend (Prometheus)»** в папке **Lab4**: файл `grafana/dashboards/lab4-backend.json`, подключение через `grafana/provisioning/dashboards/dashboards.yml`. На дашборде отображаются ряды по `app_*`, ошибки 5xx и агрегированный `rate` для `http_requests_total` из instrumentator.

**Примеры запросов в Prometheus / Grafana (PromQL)**

- Нагрузка по прикладному счётчику: `rate(app_requests_total[1m])`
- Ошибки (накопительно): `app_request_errors_total`
- Средняя/макс. задержка и линия SLO: `app_response_time_avg_ms`, `app_response_time_max_ms`, `app_response_time_slo_ms`
- Сводный RPS по instrumentator: `sum(rate(http_requests_total[1m]))`

#### Шаг 4. Контейнеризация и оркестрация
Система упакована в Docker-контейнеры:
- **Backend**: `backend/Dockerfile` на базе Python 3.10-slim.
- **Frontend**: `frontend/Dockerfile` с многоэтапной сборкой (Node.js + Nginx).
- **Orchestration**: `docker-compose.yml` описывает сервисы: `db` (PostgreSQL), `s3` (MinIO), `backend`, `frontend`, **`prometheus`** (сбор метрик), **`grafana`** (визуализация).
- Конфигурация секретов и БД вынесена в файл `.env` (в репозиторий не коммитится).
- Запуск стека: `docker compose up --build` (или `docker-compose up --build` в зависимости от версии CLI).

#### Шаг 5. Подготовка демонстрации и финальной документации
- **Документация**: в корне проекта обновлён `README.md` с описанием проекта, инструкцией по запуску и примерами использования.
- **Тестовые данные**: для демонстрации могут быть использованы научные статьи в формате PDF.
- **API Docs**: автоматически генерируемая документация Swagger доступна по адресу `http://localhost:8080/docs`.

### 3. Заключение
В ходе работы был создан полноценный Full-stack ML-сервис, готовый к развертыванию. Реализована цепочка от загрузки файла и инференса моделей до хранения данных, логирования и наблюдаемости: метрики экспортируются с бэкенда, собираются Prometheus и отображаются в Grafana; дополнительно доступны оперативные системные показатели через `/system/stats` и страницу мониторинга во фронтенде.
