# Научная библиотека

Система для управления научной литературой с использованием ИИ для извлечения метаданных и суммаризации.

## Основные ссылки
- [Figma Design](https://www.figma.com/design/RuXdabUEhvoyLswiZVBile/%D0%91%D0%B8%D0%B1%D0%BB%D0%B8%D0%BE%D1%82%D0%B5%D0%BA%D0%B0-%D1%81%D1%82%D0%B0%D1%82%D0%B5%D0%B9?t=N8drr6xWdlPVuTCe-1)

## Технологии
- **Backend**: FastAPI, SQLAlchemy (PostgreSQL), MinIO (S3), HuggingFace Transformers.
- **Frontend**: React, Vite, Tailwind CSS, Shadcn/UI.
- **Monitoring**: Prometheus (Metrics), Logging.
- **DevOps**: Docker, Docker Compose.

## Требования
- Docker
- Docker Compose

## Запуск проекта

Для запуска всей системы (бэкенд, фронтенд, база данных, S3) выполните одну команду:

```bash
docker-compose up --build
```

### Доступ к сервисам:
- **Frontend**: [http://localhost](http://localhost)
- **Backend API**: [http://localhost:8080](http://localhost:8080)
- **API Docs (Swagger)**: [http://localhost:8080/docs](http://localhost:8080/docs)
- **Metrics**: [http://localhost:8080/metrics](http://localhost:8080/metrics)
- **System Stats**: [http://localhost:8080/system/stats](http://localhost:8080/system/stats)
- **MinIO Console**: [http://localhost:9001](http://localhost:9001) (User: `minioadmin`, Pass: `minioadmin`)

## Мониторинг
- **Логирование**: Все запросы и ошибки логируются в консоль контейнера `library_backend` и файл `backend.log`.
- **Метрики**:
  - `/metrics`: Стандартные метрики Prometheus (время ответа, количество запросов и т.д.).
  - `/system/stats`: Текущая нагрузка на систему (CPU, RAM, Disk).

## Разработка

Если вы хотите запустить компоненты отдельно:

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8080
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
