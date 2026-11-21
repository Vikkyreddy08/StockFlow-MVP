# StockFlow MVP

A multi-tenant SaaS inventory management system. Organisations register, sign in,
manage their product catalogue, and track stock levels through a dashboard with
low-stock indicators.

## Tech stack

**Backend**
- Python 3.11, Django 5.2.19, Django REST Framework 3.18.3
- SimpleJWT (JWT authentication), django-cors-headers
- MySQL 8 (local development) via PyMySQL, PostgreSQL (production) via psycopg
- WhiteNoise (static files), Gunicorn (WSGI server)

**Frontend**
- React 19, Vite 7, React Router 7, Axios
- Tailwind CSS 4

## Features

- JWT authentication: registration and login
- Multi-tenant data isolation — every record is scoped to the authenticated
  user's organisation
- Product CRUD with case-insensitive, searchable product list
- Case-insensitive uniqueness of SKUs within an organisation
- Dashboard summary with low-stock detection based on a per-product threshold

## Repository layout

```
backend/      Django project (config/ settings + accounts, organizations, inventory apps)
frontend/     React SPA (src/ with service-layer API clients)
```

## Local development

### Backend

```powershell
cd backend
py -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env          # then edit .env
python manage.py migrate
python manage.py runserver           # http://localhost:8000
```

### Frontend

```powershell
cd frontend
npm install
Copy-Item .env.example .env          # then edit .env
npm run dev                          # http://localhost:5173
```

## Environment variables

### Backend (`backend/.env`)

| Variable | Purpose |
|----------|---------|
| `DJANGO_SECRET_KEY` | Signing key. **Required when `DEBUG=False`.** |
| `DJANGO_DEBUG` | Debug mode. Defaults to `False`; set `True` for local work. |
| `DJANGO_ALLOWED_HOSTS` | Comma-separated allowed hosts. |
| `MYSQL_DATABASE` / `MYSQL_USER` / `MYSQL_PASSWORD` / `MYSQL_HOST` / `MYSQL_PORT` | Local MySQL. If `MYSQL_DATABASE` is unset the app falls back to SQLite. |
| `DATABASE_URL` | When set, selects PostgreSQL and takes precedence over MySQL. |
| `CORS_ALLOWED_ORIGINS` | Comma-separated frontend origins allowed to call the API. |
| `CSRF_TRUSTED_ORIGINS` | Comma-separated trusted origins for unsafe requests (e.g. admin). |
| `USE_X_FORWARDED_PROTO` | Set `True` behind a TLS-terminating proxy (e.g. Render). |
| `POSTGRES_SSLMODE` | Optional; overrides the default `sslmode=require` for PostgreSQL. |

**Database selection order:** `DATABASE_URL` → PostgreSQL · else `MYSQL_DATABASE`
→ MySQL · else SQLite.

### Frontend (`frontend/.env`)

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | Base URL of the Django API (default `http://localhost:8000/api`). |

Never commit real `.env` files or credentials.

## API endpoints

| Endpoint | Purpose |
|----------|---------|
| `/api/auth/` | Registration and JWT login/refresh |
| `/api/products/` | Product list/create, detail update/delete, `?search=` |
| `/api/dashboard/` | Dashboard summary and low-stock items |

## Tests

```powershell
cd backend
python manage.py test
```

The backend suite covers authentication, organisation isolation, product CRUD and
product search.

## Deployment

- **Backend → Render Web Service** (root directory `backend`)
  - Build: `pip install -r requirements.txt && python manage.py collectstatic --noinput`
  - Start: `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT` (see `backend/Procfile`)
- **Database → Render PostgreSQL** — link the instance so `DATABASE_URL` is injected.
- **Frontend → Vercel** — set `VITE_API_BASE_URL` to the deployed API URL.

Required Render environment variables: `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`,
`CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`, `USE_X_FORWARDED_PROTO=True`, plus
the auto-injected `DATABASE_URL`.
