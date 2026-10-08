# Society Gate Management

A full-stack visitor management system for residential societies. Guards register visitors at the gate, residents approve or deny entry, and administrators manage society operations.

## Why this project

This project demonstrates practical backend engineering with **FastAPI, PostgreSQL, SQLAlchemy, JWT authentication, role-based authorization, file uploads, and third-party service integration**.

## Key Features

- **Role-based access** — Admin, Guard, and Resident workflows
- **JWT authentication** with password hashing and account status checks
- **Visitor workflow** — pending → approved/denied → exited
- **Visitor photos** stored through Cloudinary with file validation
- **WhatsApp notifications** through Twilio
- **Admin reporting** for visitor and society activity
- **Frequent visitor management** for residents
- **React dashboards** for each role

## Architecture

```text
React + Vite
     │
     │ REST / JWT
     ▼
FastAPI
 ├── Authentication
 ├── Visitor APIs
 ├── Resident APIs
 ├── Admin APIs
 └── WhatsApp integration
     │
     ├──────────────► PostgreSQL
     ├──────────────► Cloudinary
     └──────────────► Twilio WhatsApp
```

## Tech Stack

**Backend:** Python, FastAPI, SQLAlchemy, PostgreSQL, Pydantic, JWT, bcrypt
**Frontend:** React, Vite, React Router, Axios
**Integrations:** Twilio WhatsApp, Cloudinary

## Project Structure

```text
society-gate/
├── backend/
│   ├── main.py
│   ├── auth.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   └── routers/
│       ├── auth.py
│       ├── visitors.py
│       ├── residents.py
│       ├── admin.py
│       └── whatsapp.py
└── frontend/
    └── src/
        ├── api/
        ├── components/
        └── pages/
```

## Local Setup

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Fill in the values in `backend/.env`.

Start the API:

```bash
uvicorn main:app --reload
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Optional frontend environment variable:

```env
VITE_API_URL=http://127.0.0.1:8000
```

## Database

The current standalone version creates missing SQLAlchemy tables on startup for easy local setup. For production deployment, the next step would be to manage schema changes with Alembic migrations.

## User Roles

| Role | Responsibilities |
|---|---|
| Admin | Manage societies, flats, guards and reports |
| Guard | Register visitors and manage entry/exit |
| Resident | Approve/deny visitors and manage frequent visitors |

Public registration creates **resident accounts only**. Admins create guard accounts from the protected admin API.

## Security Highlights

- Passwords are hashed with bcrypt.
- JWTs expire and are validated against active database users.
- API endpoints enforce role-based authorization.
- Residents can access only visitors associated with their own flat.
- Visitor status transitions are validated.
- Visitor image uploads are restricted by type and size.
- WhatsApp approval links do not directly mutate visitor state.
- Secrets are loaded from environment variables and are not committed.

## License

MIT
