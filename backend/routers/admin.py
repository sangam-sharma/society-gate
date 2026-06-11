from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user, hash_password, require_admin, get_current_user
import models
import schemas

router = APIRouter()

# ─── Society ────────────────────────────────────────────
@router.post("/society", response_model=schemas.SocietyOut)
def create_society(
    payload: schemas.SocietyCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    society = models.Society(
        name=payload.name,
        address=payload.address
    )
    db.add(society)
    db.commit()
    db.refresh(society)
    return society

@router.get("/flats", response_model=list[schemas.FlatOut])
def get_flats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Society).all()

# ─── Flats ──────────────────────────────────────────────
@router.post("/flat", response_model=schemas.FlatOut)
def create_flat(
    payload: schemas.FlatCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    society = db.query(models.Society).filter(
        models.Society.id == payload.society_id
    ).first()
    if not society:
        raise HTTPException(status_code=404, detail="Society not found")

    flat = models.Flat(
        flat_number=payload.flat_number,
        floor=payload.floor,
        society_id=payload.society_id
    )
    db.add(flat)
    db.commit()
    db.refresh(flat)
    return flat

@router.get("/flats", response_model=list[schemas.FlatOut])
def get_flats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    return db.query(models.Flat).all()

@router.delete("/flat/{flat_id}")
def delete_flat(
    flat_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    flat = db.query(models.Flat).filter(models.Flat.id == flat_id).first()
    if not flat:
        raise HTTPException(status_code=404, detail="Flat not found")
    db.delete(flat)
    db.commit()
    return {"message": "Flat deleted"}

# ─── Users ──────────────────────────────────────────────
@router.get("/users", response_model=list[schemas.UserOut])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    return db.query(models.User).all()

@router.post("/guard", response_model=schemas.UserOut)
def create_guard(
    payload: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    existing = db.query(models.User).filter(
        models.User.email == payload.email
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    guard = models.User(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        phone=payload.phone,
        role=models.UserRole.guard,
        flat_id=None
    )
    db.add(guard)
    db.commit()
    db.refresh(guard)
    return guard

@router.delete("/user/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}

# ─── Reports ────────────────────────────────────────────
@router.get("/reports/summary")
def get_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    from datetime import datetime, date
    today = datetime.combine(date.today(), datetime.min.time())

    total_visitors = db.query(models.Visitor).count()
    today_visitors = db.query(models.Visitor).filter(
        models.Visitor.entry_time >= today
    ).count()
    pending = db.query(models.Visitor).filter(
        models.Visitor.status == models.VisitorStatus.pending
    ).count()
    approved = db.query(models.Visitor).filter(
        models.Visitor.status == models.VisitorStatus.approved
    ).count()
    denied = db.query(models.Visitor).filter(
        models.Visitor.status == models.VisitorStatus.denied
    ).count()
    total_flats = db.query(models.Flat).count()
    total_residents = db.query(models.User).filter(
        models.User.role == models.UserRole.resident
    ).count()
    total_guards = db.query(models.User).filter(
        models.User.role == models.UserRole.guard
    ).count()

    return {
        "total_visitors": total_visitors,
        "today_visitors": today_visitors,
        "pending": pending,
        "approved": approved,
        "denied": denied,
        "total_flats": total_flats,
        "total_residents": total_residents,
        "total_guards": total_guards
    }

@router.get("/reports/visitors", response_model=list[schemas.VisitorOut])
def get_all_visitors_report(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    return db.query(models.Visitor).order_by(
        models.Visitor.entry_time.desc()
    ).all()