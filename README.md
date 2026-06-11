# 🏢 Society Gate Management App

A full-stack web application for managing visitor entry and approval in a residential society. Security guards log visitors at the gate, residents get notified and can approve or deny entry instantly.

---

## 🚀 Features

- 👮 **Guard Panel** — Add visitors, upload photos, track entry/exit
- 🏠 **Resident Panel** — Approve or deny visitors, view history, manage frequent visitors
- ⚙️ **Admin Panel** — Manage societies, flats, guards and view reports
- 📱 **WhatsApp Notifications** — Residents get notified via WhatsApp when a visitor arrives
- 📷 **Photo Capture** — Guards can take visitor photos at entry
- 🚗 **Vehicle Tracking** — Log visitor vehicle numbers
- 🔐 **JWT Authentication** — Secure login for all 3 roles
- 📊 **Live Dashboard** — Real time stats for pending, inside, approved, denied

---

## 🛠️ Tech Stack

### Backend
- Python 3.12
- FastAPI
- PostgreSQL
- SQLAlchemy ORM
- JWT Authentication (python-jose)
- Password Hashing (bcrypt + passlib)
- Twilio (WhatsApp notifications)
- Cloudinary (photo storage)

### Frontend
- React 18
- Vite
- React Router DOM
- Axios
- React Hook Form

---

## 📁 Project Structure
society-gate/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── models.py            # Database models
│   ├── schemas.py           # Pydantic schemas
│   ├── database.py          # PostgreSQL connection
│   ├── auth.py              # JWT authentication
│   ├── requirements.txt     # Python dependencies
│   └── routers/
│       ├── visitors.py      # Visitor management
│       ├── residents.py     # Resident actions
│       ├── admin.py         # Admin management
│       └── whatsapp.py      # WhatsApp notifications
└── frontend/
└── src/
├── pages/           # Login, Guard, Resident, Admin dashboards
├── components/      # Navbar, ProtectedRoute, VisitorCard
└── api/             # Axios API calls
---

## ⚙️ Setup & Installation

### Prerequisites
- Python 3.12+
- Node.js 20+
- PostgreSQL 15
- Twilio account (for WhatsApp)
- Cloudinary account (for photos)

### 1. Clone the repository
```bash
git clone https://github.com/sangam-sharma/society-gate.git
cd society-gate
```

### 2. Backend setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Create `.env` file in backend folder
DATABASE_URL=postgresql://gate_user:yourpassword@localhost/society_gate
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
### 4. Setup PostgreSQL
```bash
psql postgres
CREATE DATABASE society_gate;
CREATE USER gate_user WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE society_gate TO gate_user;
GRANT ALL ON SCHEMA public TO gate_user;
\q
```

### 5. Start backend
```bash
uvicorn main:app --reload
```

### 6. Frontend setup
```bash
cd ../frontend
npm install
npm run dev
```

---

## 👤 Default Users

Create admin user via terminal:
```python
python3 -c "
from database import SessionLocal
from models import User, UserRole
from auth import hash_password

db = SessionLocal()
admin = User(
    name='Admin',
    email='admin@society.com',
    hashed_password=hash_password('admin123'),
    phone='9999999999',
    role=UserRole.admin,
    flat_id=None
)
db.add(admin)
db.commit()
db.close()
"
```

---

## 🔐 User Roles

| Role | Access | Created by |
|---|---|---|
| Admin | Full access, manage everything | Developer via terminal |
| Guard | Add visitors, track entry/exit | Admin via dashboard |
| Resident | Approve/deny visitors, view history | Admin or terminal |

---

## 📱 App Screenshots

| Login | Guard Dashboard | Resident Dashboard | Admin Dashboard |
|---|---|---|---|
| Email + Password login for all roles | Add visitors, approve/deny, track | Pending requests, history, frequent visitors | Manage societies, flats, guards |

---

## 🌐 API Documentation

Once the backend is running visit: http://127.0.0.1:8000/docs
---

## 📝 License

MIT License — feel free to use and modify.

---

Built with ❤️ by Sangam Sharma