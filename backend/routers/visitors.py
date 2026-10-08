import os
from datetime import datetime, timezone

import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

import models
import schemas
from auth import get_current_user, require_guard_or_admin
from database import get_db
from routers.whatsapp import send_whatsapp_notification

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

router = APIRouter()

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_PHOTO_SIZE = 5 * 1024 * 1024


@router.post("/", response_model=schemas.VisitorOut)
async def add_visitor(
    name: str = Form(...),
    phone: str = Form(None),
    purpose: str = Form(...),
    vehicle_number: str = Form(None),
    flat_id: int = Form(...),
    photo: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_guard_or_admin),
):
    photo_url = None

    if photo:
        if photo.content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(status_code=400, detail="Photo must be JPEG, PNG, or WEBP")

        content = await photo.read()
        if len(content) > MAX_PHOTO_SIZE:
            raise HTTPException(status_code=400, detail="Photo must be 5 MB or smaller")

        result = cloudinary.uploader.upload(content, folder="society-gate")
        photo_url = result["secure_url"]

    flat = db.query(models.Flat).filter(models.Flat.id == flat_id).first()
    if not flat:
        raise HTTPException(status_code=404, detail="Flat not found")

    visitor = models.Visitor(
        name=name,
        phone=phone,
        purpose=purpose,
        vehicle_number=vehicle_number,
        photo_url=photo_url,
        flat_id=flat_id,
        status=models.VisitorStatus.pending,
    )
    db.add(visitor)
    db.commit()
    db.refresh(visitor)

    resident = db.query(models.User).filter(
        models.User.flat_id == flat_id,
        models.User.role == models.UserRole.resident,
        models.User.is_active.is_(True),
    ).first()

    if resident and resident.phone:
        send_whatsapp_notification(
            to_phone=resident.phone,
            visitor_name=name,
            purpose=purpose,
            flat_number=flat.flat_number,
            visitor_id=visitor.id,
        )

    return visitor


@router.get("/", response_model=list[schemas.VisitorOut])
def get_all_visitors(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_guard_or_admin),
):
    return db.query(models.Visitor).order_by(models.Visitor.entry_time.desc()).all()


@router.get("/pending", response_model=list[schemas.VisitorOut])
def get_pending_visitors(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_guard_or_admin),
):
    return db.query(models.Visitor).filter(
        models.Visitor.status == models.VisitorStatus.pending
    ).order_by(models.Visitor.entry_time.desc()).all()


@router.get("/{visitor_id}", response_model=schemas.VisitorOut)
def get_visitor(
    visitor_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    visitor = db.query(models.Visitor).filter(models.Visitor.id == visitor_id).first()
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")

    if current_user.role == models.UserRole.resident and visitor.flat_id != current_user.flat_id:
        raise HTTPException(status_code=403, detail="This visitor is not for your flat")

    return visitor


@router.patch("/{visitor_id}/status", response_model=schemas.VisitorOut)
def update_visitor_status(
    visitor_id: int,
    payload: schemas.VisitorStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_guard_or_admin),
):
    visitor = db.query(models.Visitor).filter(models.Visitor.id == visitor_id).first()
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")

    allowed = {
        models.VisitorStatus.pending: {
            models.VisitorStatus.approved,
            models.VisitorStatus.denied,
        }
    }
    if payload.status not in allowed.get(visitor.status, set()):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status transition: {visitor.status} -> {payload.status}",
        )

    visitor.status = payload.status
    visitor.approved_by = current_user.id
    db.commit()
    db.refresh(visitor)
    return visitor


@router.patch("/{visitor_id}/exit", response_model=schemas.VisitorOut)
def mark_exit(
    visitor_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_guard_or_admin),
):
    visitor = db.query(models.Visitor).filter(models.Visitor.id == visitor_id).first()
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")

    if visitor.status != models.VisitorStatus.approved:
        raise HTTPException(status_code=400, detail="Only approved visitors can exit")

    visitor.exit_time = datetime.now(timezone.utc)
    visitor.status = models.VisitorStatus.exited
    db.commit()
    db.refresh(visitor)
    return visitor


@router.get("/flat/{flat_id}", response_model=list[schemas.VisitorOut])
def get_visitors_by_flat(
    flat_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role == models.UserRole.resident and current_user.flat_id != flat_id:
        raise HTTPException(status_code=403, detail="You can only access your own flat")

    if current_user.role not in (
        models.UserRole.admin,
        models.UserRole.guard,
        models.UserRole.resident,
    ):
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    return db.query(models.Visitor).filter(
        models.Visitor.flat_id == flat_id
    ).order_by(models.Visitor.entry_time.desc()).all()


@router.get("/flats/all")
def get_flats_for_guard(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_guard_or_admin),
):
    flats = db.query(models.Flat).order_by(models.Flat.flat_number).all()
    return [{"id": f.id, "flat_number": f.flat_number} for f in flats]
