# Backend (FastAPI)

## Запуск (локально)
- Требования: Python 3.10+, pip
- Установка:
  - `cd backend`
  - `python -m venv .venv` (опционально)
  - `.\.venv\Scripts\activate` (Windows, если использовали venv)
  - `pip install -r requirements.txt`
- Старт сервера:
  - `uvicorn app.main:app --reload --port 8000`
  - Откройте: `http://localhost:8000/docs` (Swagger UI)

## Эндпоинты (без авторизации, in-memory)
- `GET /health` — состояние сервиса
- `GET /` — корень API
- Статьи:
  - `GET /articles` — список
  - `GET /articles/{id}` — получить по ID
  - `POST /articles` — создать (title, abstract?, tags[], citations[])
  - `PUT /articles/{id}` — обновить
  - `DELETE /articles/{id}` — удалить
- Теги:
  - `GET /tags` — список тегов
  - `GET /tags/{id}` — получить тег
  - `POST /tags` — создать тег (name, color?)
  - `DELETE /tags/{id}` — удалить тег

## Структура
- `app/main.py` — создание FastAPI-приложения и подключение роутеров
- `app/schemas.py` — Pydantic-схемы (Article, Tag, Citation и CRUD-модели)
- `app/storage.py` — in-memory хранилище, генерация UUID и ISO-datetime
- `app/routers/` — маршруты: `health.py`, `articles.py`, `tags.py`

## Примечания
- CORS включён (`*`) для удобства разработки фронтенда.
- Хранение данных в памяти — при перезапуске очищается.
  Для персистентности добавим БД на следующем шаге.
