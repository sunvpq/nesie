# Nesie

**Кредитный рейтинг под контролем**

Nesie — мобильное веб-приложение для казахстанских пользователей, которое позволяет отслеживать кредитный рейтинг из ПКБ (Первое кредитное бюро), видеть все свои кредиты в одном месте и симулировать влияние нового кредита на скор до подачи заявки.

## Возможности

- Просмотр кредитного рейтинга и факторов влияния
- Список всех активных кредитов с ближайшими платежами
- Симулятор кредита с расчётом ставки, переплаты, влияния на скор и вероятности одобрения
- AI-объяснение финансового решения через Claude API
- Двуязычный интерфейс (русский / казахский)
- Тёмная и светлая тема
- Реферальная программа и подписка Nesie Pro

## Стек технологий

| Слой | Технологии |
|------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS 4, Framer Motion, Zustand |
| Backend | Python, FastAPI, SQLAlchemy 2, Alembic, asyncpg |
| БД | PostgreSQL 16 |
| Инфра | Docker Compose |

## Запуск локально

### Через Docker Compose (рекомендуется)

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

### Вручную

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Переменные окружения

### Backend (`backend/.env`)

```
DATABASE_URL=postgresql+asyncpg://nesie:nesiepass@localhost:5432/nesie
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=30
```

### Frontend (`frontend/.env`)

```
VITE_API_BASE_URL=http://localhost:8000
VITE_ANTHROPIC_API_KEY=sk-ant-...   # для AI-объяснений в симуляторе
```

## Лицензия

Проприетарный. Все права защищены.
