# LHS — Lawyer Hiring System

A production-ready full-stack web application for hiring lawyers across India.

- **Backend:** Python FastAPI + PostgreSQL + SQLAlchemy + Alembic
- **Package Manager:** [UV](https://docs.astral.sh/uv/) (fast Python package manager)
- **Frontend:** HTML5, Bootstrap 5, Vanilla JavaScript
- **Auth:** JWT Bearer tokens

---

## Project Structure

```
LHS/
├── backend/                        # FastAPI application
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI entry point
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── api.py              # Root API router
│   │   │   ├── deps.py             # Shared dependencies (auth, DB session)
│   │   │   └── endpoints/
│   │   │       ├── __init__.py
│   │   │       ├── admin.py        # Admin CRUD
│   │   │       ├── auth.py         # Login, register, change password
│   │   │       ├── lawyers.py      # Lawyer CRUD + public listing
│   │   │       ├── pages.py        # CMS pages
│   │   │       └── practice_areas.py
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py           # Pydantic settings (.env loader)
│   │   │   └── security.py         # JWT & password hashing
│   │   ├── db/
│   │   │   ├── __init__.py
│   │   │   └── session.py          # SQLAlchemy engine & session
│   │   ├── models/                 # SQLAlchemy ORM models
│   │   │   ├── __init__.py
│   │   │   ├── admin.py
│   │   │   ├── lawyer.py
│   │   │   ├── page.py
│   │   │   └── practice_area.py
│   │   └── schemas/                # Pydantic request/response schemas
│   │       ├── __init__.py
│   │       ├── admin.py
│   │       ├── auth.py
│   │       ├── lawyer.py
│   │       ├── page.py
│   │       └── practice_area.py
│   ├── alembic/                    # Database migrations
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   └── versions/
│   ├── static/uploads/             # Uploaded profile pictures
│   ├── .venv/                      # UV-managed virtual environment
│   ├── alembic.ini
│   ├── schema.sql                  # Reference SQL schema
│   ├── pyproject.toml              # Project config + dependencies
│   ├── uv.lock                     # UV lockfile
│   └── .env                        # Environment variables
│
└── frontend/                       # Static HTML/JS frontend
    ├── index.html
    ├── about.html
    ├── contact.html
    ├── lawyers.html
    ├── lawyer-detail.html
    ├── admin/
    │   ├── login.html
    │   ├── dashboard.html
    │   ├── lawyers.html
    │   ├── practice-areas.html
    │   └── pages.html
    └── assets/
        ├── css/
        │   ├── style.css           # Public site styles
        │   └── admin.css           # Admin panel styles
        └── js/
            ├── api.js              # API client helper
            ├── main.js             # Public site logic
            ├── lawyers.js          # Lawyer listing logic
            └── admin/
                ├── auth.js
                ├── dashboard.js
                ├── lawyers.js
                ├── pages.js
                └── practice-areas.js
```

---

## Setup & Installation

### Prerequisites
- Python 3.10+
- [UV](https://docs.astral.sh/uv/getting-started/installation/) — install with:
  ```powershell
  powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
  ```
- PostgreSQL 14+

---

### 1. Create PostgreSQL Database

```sql
CREATE DATABASE lhsdb;
```

---

### 2. Configure Environment

Edit `backend/.env` with your database credentials:

```env
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password_here
POSTGRES_DB=lhsdb

SECRET_KEY=your_long_random_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

ALLOWED_ORIGINS=http://localhost:5500,http://127.0.0.1:5500

UPLOAD_DIR=static/uploads
MAX_UPLOAD_SIZE_MB=5
```

Generate a secure `SECRET_KEY`:
```powershell
cd backend
uv run python -c "import secrets; print(secrets.token_hex(32))"
```

---

### 3. Install Dependencies (UV)

```powershell
cd backend

# Create virtual environment and install all dependencies from uv.lock
uv sync
```

UV automatically:
- Creates `.venv/` inside `backend/`
- Installs all pinned packages from `uv.lock`
- No need to activate the venv manually

To also install dev dependencies (pytest, httpx):
```powershell
uv sync --group dev
```

---

### 4. Run Database Migrations

Tables are auto-created on first startup. For production, use Alembic:

```powershell
# Initialize Alembic (first time only)
uv run alembic init alembic

# Generate migration from current models
uv run alembic revision --autogenerate -m "initial schema"

# Apply all migrations
uv run alembic upgrade head
```

---

### 5. Start the Backend Server

```powershell
cd backend
uv run uvicorn app.main:app --reload --port 8000
```

Or using the shorthand:
```powershell
uv run uvicorn app.main:app --reload
```

Available at:
- **API Root:** http://localhost:8000
- **Swagger UI:** http://localhost:8000/docs *(development only)*
- **ReDoc:** http://localhost:8000/redoc *(development only)*

---

### 6. Create the First Admin

Open `frontend/admin/login.html` → click **"Create Admin Account"** → fill in the form.

> The `/api/auth/register` endpoint **only works when zero admins exist**. After the first account is created, it returns `403 Forbidden`.

---

### 7. Open the Frontend

```powershell
# Option 1: Python's built-in server (from LHS root)
python -m http.server 5500 --directory frontend

# Option 2: VS Code Live Server
# Right-click frontend/index.html → Open with Live Server
```

---

## UV Quick Reference

| Command | Description |
|---|---|
| `uv sync` | Install/update all dependencies from lockfile |
| `uv sync --group dev` | Include dev dependencies |
| `uv add <package>` | Add a new dependency |
| `uv remove <package>` | Remove a dependency |
| `uv run <command>` | Run a command inside the managed venv |
| `uv run uvicorn app.main:app --reload` | Start the dev server |
| `uv run alembic upgrade head` | Run DB migrations |
| `uv run python -c "..."` | Run Python inline |
| `uv lock` | Regenerate the lockfile |
| `uv pip list` | List installed packages |

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | — | Admin login (returns JWT) |
| GET | `/api/auth/me` | ✅ | Current admin profile |
| POST | `/api/auth/register` | — | Bootstrap first admin (one-time) |
| POST | `/api/auth/change-password` | ✅ | Change password |
| GET | `/api/lawyers/` | — | Public lawyer list (search/filter/page) |
| GET | `/api/lawyers/{id}` | — | Public lawyer by ID |
| GET | `/api/lawyers/admin/all` | ✅ | Admin: all lawyers |
| POST | `/api/lawyers/admin` | ✅ | Create lawyer (multipart) |
| PUT | `/api/lawyers/admin/{id}` | ✅ | Update lawyer (multipart) |
| PATCH | `/api/lawyers/admin/{id}/toggle-public` | ✅ | Toggle visibility |
| DELETE | `/api/lawyers/admin/{id}` | ✅ | Delete lawyer |
| GET | `/api/practice-areas/` | — | List practice areas |
| POST | `/api/practice-areas/` | ✅ | Create practice area |
| PUT | `/api/practice-areas/{id}` | ✅ | Update practice area |
| DELETE | `/api/practice-areas/{id}` | ✅ | Delete practice area |
| GET | `/api/pages/{pagetype}` | — | Get page content |
| PUT | `/api/pages/{pagetype}` | ✅ | Create/update page |
| GET | `/api/admins/` | ✅ | List all admins |
| POST | `/api/admins/` | ✅ | Create admin |
| DELETE | `/api/admins/{id}` | ✅ | Delete admin |

---

## Production Deployment

1. Set `APP_ENV=production` in `.env` — disables Swagger UI
2. Set a strong, unique `SECRET_KEY` (32+ hex chars)
3. Restrict `ALLOWED_ORIGINS` to your actual frontend domain
4. Use Nginx as a reverse proxy with SSL/TLS
5. Run with Gunicorn + Uvicorn workers:
   ```bash
   uv run gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000
   ```
