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

## Логин локално

За да тестваш вход локално:

1. В `server/.env` трябва да има и: `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` (същите като за Vercel).
2. Стартирай сървъра: в папка `server` → `npm run dev`.
3. В друг терминал от корена на проекта стартирай фронтенда: `npm run dev`.
4. Отвори `http://localhost:3000` – заявките към `/api/*` се пренасочват към сървъра на порт 3001. Влез с потребителя и паролата от `.env`.

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
  - За вход като администратор (редакция на „За нас“):
    - `JWT_SECRET` = произволен дълъг таен низ (напр. генериран с `openssl rand -base64 32`).
    - `ADMIN_USERNAME` = потребителско име за админ (по подразбиране `admin`).
    - `ADMIN_PASSWORD` = парола за админ.
- След деплой:
  - Сайтът е на `https://твой-проект.vercel.app`
  - API: `https://твой-проект.vercel.app/api/health` и `https://твой-проект.vercel.app/api/progress`

Локално за сървър можеш да ползваш `server/` (Express); в production Vercel използва само `api/` (serverless).
