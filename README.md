# LearnIT Backend

Backend API untuk website pembelajaran LearnIT menggunakan Express.js dan PostgreSQL.

## Features
- Authentication & Authorization (JWT)
- Forgot Password
- Reset Password
- Categories 
- Materials
- Material Contents
- Quiz
- Search Materials
- Progress Tracking
- Forum Discussion & Comments

## Tech
- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- bcrypt

## Project Structure
```bash
src/
 ├── controllers/
 ├── routes/
 ├── services/
 ├── middleware/
 ├── config/
 └── app.js
```

## Installation

Clone repository:

```bash
git clone https://github.com/username/backend_learnit.git
```

Install dependencies:

```bash
npm install
```

Create `.env` file:

```env
PORT=3000
DB_USER=your_db_user
DB_HOST=localhost
DB_NAME=your_database_name
DB_PASS=your_database_password
DB_PORT=5432

JWT_SECRET=your_secret_key
```

Run server:

```bash
npm run dev
```

## Database
File database available:

```bash
learnitdb_fix.sql
```

## Secrets & Deployment

- Local development:
	- Copy `.env.example` to `.env` and fill in your values. Do NOT commit `.env`.
	- To start locally:

```bash
cp .env.example .env
# edit .env -> set DATABASE_URL or local DB vars
npm install
npm run dev
```

- Using Neon (cloud DB):
	- In the Neon dashboard, click **Connect** for your branch and copy the provided connection string.
	- Put the full string into `DATABASE_URL` in your local environment or in your deployment secret store. Example format:

```
postgresql://<neon_user>:<neon_password>@<project>.<region>.neon.tech:5432/<database_name>?sslmode=require&channel_binding=require
```

- Deployments (Vercel / Heroku / other):
	- Configure a project secret named `DATABASE_URL` with the full Neon connection string.
	- On Vercel: in Project Settings → Environment Variables, add `DATABASE_URL` for Production/Preview/Development.
	- On Heroku: `heroku config:set DATABASE_URL="your_connection_string"`.

- Security tips:
	- Never commit `.env` with secrets. Keep `.env` in `.gitignore` (already configured).
	- For production, use the platform's secret manager (Vercel/Heroku/Azure/GCP) or a dedicated secrets store.


## API Endpoints
### Authentication
- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/forgot-password`

### Categories
- GET `/api/categories`
- POST `/api/categories`

### Materials
- GET `/api/materials`
- POST `/api/materials`

### Quiz
- POST `/api/quizzes`
- POST `/api/questions`
- POST `/api/quizzes/submit`

## Download Postman API Collection
https://drive.google.com/file/d/1HbMDLYE0Il2YXwbwTttJeGQhX2zOkp4l/view?usp=sharing  
