from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models
from routers import visitors, residents, admin, whatsapp

# ─── Create all tables ──────────────────────────────────
Base.metadata.create_all(bind=engine)

# ─── App ────────────────────────────────────────────────
app = FastAPI(
    title="Society Gate Management",
    description="API for managing visitor entry and approval in a society",
    version="1.0.0"
)

# ─── CORS ───────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ────────────────────────────────────────────
app.include_router(visitors.router,  prefix="/visitors",  tags=["Visitors"])
app.include_router(residents.router, prefix="/residents", tags=["Residents"])
app.include_router(admin.router,     prefix="/admin",     tags=["Admin"])
app.include_router(whatsapp.router,  prefix="/whatsapp",  tags=["WhatsApp"])

# ─── Auth routes ────────────────────────────────────────
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from schemas import UserCreate, UserLogin, Token
from auth import hash_password, verify_password, create_access_token

@app.post("/auth/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = models.User(
        name=user.name,
        email=user.email,
        hashed_password=hash_password(user.password),
        phone=user.phone,
        role=user.role,
        flat_id=user.flat_id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    token = create_access_token({"user_id": new_user.id, "role": new_user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": new_user.role,
        "user_id": new_user.id,
        "flat_id": new_user.flat_id
    }

@app.post("/auth/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"user_id": db_user.id, "role": db_user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": db_user.role,
        "user_id": db_user.id,
        "flat_id": db_user.flat_id
    }

@app.get("/")
def root():
    return {"message": "Society Gate API is running"}