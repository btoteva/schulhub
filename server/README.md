# SchulHub API (Neon PostgreSQL)

Малък сървър за запазване на напредък в Neon PostgreSQL.

## Първо стартиране

1. Копирай `.env.example` като `.env` в тази папка (`server/.env`).
2. В `.env` сложи своя Neon connection string:
   ```
   DATABASE_URL=postgresql://neondb_owner:npg_xxx@ep-xxx.neon.tech/neondb?sslmode=require
   ```
3. Инсталирай зависимости и пусни сървъра:
   ```bash
   cd server
   npm install
   npm run dev
   ```
4. API-то е на `http://localhost:3001`.

## Endpoints

- **GET** `/api/health` – проверка дали сървърът и БД са ок.
- **GET** `/api/progress?key=schulhub-dsd-modellsatz-3` – взима запазен напредък по ключ.
- **POST** `/api/progress` – запазва напредък. Body: `{ "key": "schulhub-dsd-modellsatz-3", "value": { ... } }`.

Таблицата `schulhub_progress` се създава автоматично при старт.

## Деплой на Vercel (GitHub → Vercel)

При качване на проекта в GitHub и свързване с Vercel:

- **Frontend** (React) и **API** (Neon) работят в един и същи проект. Папката `api/` в корена на проекта съдържа serverless функциите – Vercel ги разпознава автоматично.
- В **Vercel Dashboard** → проект → **Settings** → **Environment Variables** добави:
  - `DATABASE_URL` = твоят Neon connection string (същият като в `server/.env`).
- След деплой:
  - Сайтът е на `https://твой-проект.vercel.app`
  - API: `https://твой-проект.vercel.app/api/health` и `https://твой-проект.vercel.app/api/progress`

Локално за сървър можеш да ползваш `server/` (Express); в production Vercel използва само `api/` (serverless).
