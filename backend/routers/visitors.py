from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
import models
import schemas
import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv
from routers.whatsapp import send_whatsapp_notification

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

router = APIRouter()

# ─── Add Visitor ────────────────────────────────────────
@router.post("/", response_model=schemas.VisitorOut)
async def add_visitor(
    name: str = Form(...),
    phone: str = Form(None),
    purpose: str = Form(...),
    vehicle_number: str = Form(None),
    flat_id: int = Form(...),
    photo: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # upload photo to cloudinary if provided
    photo_url = None
    if photo:
        result = cloudinary.uploader.upload(await photo.read(), folder="society-gate")
        photo_url = result["secure_url"]

    # check flat exists
    flat = db.query(models.Flat).filter(models.Flat.id == flat_id).first()
    if not flat:
        raise HTTPException(status_code=404, detail="Flat not found")

    # create visitor
    visitor = models.Visitor(
        name=name,
        phone=phone,
        purpose=purpose,
        vehicle_number=vehicle_number,
        photo_url=photo_url,
        flat_id=flat_id,
        status=models.VisitorStatus.pending
    )
    db.add(visitor)
    db.commit()
    db.refresh(visitor)

    # send whatsapp to resident
    resident = db.query(models.User).filter(
        models.User.flat_id == flat_id,
        models.User.role == models.UserRole.resident
    ).first()

    if resident and resident.phone:
        send_whatsapp_notification(
            to_phone=resident.phone,
            visitor_name=name,
            purpose=purpose,
            flat_number=flat.flat_number,
            visitor_id=visitor.id
        )

    return visitor

# ─── Get all visitors (guard/admin) ─────────────────────
@router.get("/", response_model=list[schemas.VisitorOut])
def get_all_visitors(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Visitor).order_by(models.Visitor.entry_time.desc()).all()

# ─── Get pending visitors ────────────────────────────────
@router.get("/pending", response_model=list[schemas.VisitorOut])
def get_pending_visitors(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Visitor).filter(
        models.Visitor.status == models.VisitorStatus.pending
    ).all()

# ─── Get single visitor ──────────────────────────────────
@router.get("/{visitor_id}", response_model=schemas.VisitorOut)
def get_visitor(
    visitor_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    visitor = db.query(models.Visitor).filter(models.Visitor.id == visitor_id).first()
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")
    return visitor

# ─── Approve / Deny visitor ──────────────────────────────
@router.patch("/{visitor_id}/status", response_model=schemas.VisitorOut)
def update_visitor_status(
    visitor_id: int,
    payload: schemas.VisitorStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    visitor = db.query(models.Visitor).filter(models.Visitor.id == visitor_id).first()
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")
    visitor.status = payload.status
    visitor.approved_by = current_user.id
    db.commit()
    db.refresh(visitor)
    return visitor

# ─── Mark exit ───────────────────────────────────────────
@router.patch("/{visitor_id}/exit", response_model=schemas.VisitorOut)
def mark_exit(
    visitor_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    from datetime import datetime
    visitor = db.query(models.Visitor).filter(models.Visitor.id == visitor_id).first()
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")
    visitor.exit_time = datetime.utcnow()
    visitor.status = models.VisitorStatus.exited
    db.commit()
    db.refresh(visitor)
    return visitor

# ─── Get visitors by flat ────────────────────────────────
@router.get("/flat/{flat_id}", response_model=list[schemas.VisitorOut])
def get_visitors_by_flat(
    flat_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Visitor).filter(
        models.Visitor.flat_id == flat_id
    ).order_by(models.Visitor.entry_time.desc()).all()
# ─── Get all flats (for guard dropdown) ─────────────────
@router.get("/flats/all")
def get_flats_for_guard(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    flats = db.query(models.Flat).all()
    return [{"id": f.id, "flat_number": f.flat_number} for f in flats]