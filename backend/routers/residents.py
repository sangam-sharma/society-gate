from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
import models
import schemas

router = APIRouter()

# ─── Get my flat's pending visitors ─────────────────────
@router.get("/pending", response_model=list[schemas.VisitorOut])
def get_my_pending_visitors(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not current_user.flat_id:
        raise HTTPException(status_code=400, detail="No flat assigned to this user")
    return db.query(models.Visitor).filter(
        models.Visitor.flat_id == current_user.flat_id,
        models.Visitor.status == models.VisitorStatus.pending
    ).order_by(models.Visitor.entry_time.desc()).all()

# ─── Get my flat's visitor history ──────────────────────
@router.get("/history", response_model=list[schemas.VisitorOut])
def get_my_visitor_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not current_user.flat_id:
        raise HTTPException(status_code=400, detail="No flat assigned to this user")
    return db.query(models.Visitor).filter(
        models.Visitor.flat_id == current_user.flat_id
    ).order_by(models.Visitor.entry_time.desc()).all()

# ─── Approve or deny visitor ────────────────────────────
@router.patch("/{visitor_id}/respond", response_model=schemas.VisitorOut)
def respond_to_visitor(
    visitor_id: int,
    payload: schemas.VisitorStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    visitor = db.query(models.Visitor).filter(
        models.Visitor.id == visitor_id
    ).first()

    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")

    if visitor.flat_id != current_user.flat_id:
        raise HTTPException(status_code=403, detail="This visitor is not for your flat")

    if visitor.status != models.VisitorStatus.pending:
        raise HTTPException(status_code=400, detail="Visitor already responded to")

    visitor.status = payload.status
    visitor.approved_by = current_user.id
    db.commit()
    db.refresh(visitor)
    return visitor

# ─── Get my frequent visitors ────────────────────────────
@router.get("/frequent", response_model=list[schemas.FrequentVisitorOut])
def get_frequent_visitors(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not current_user.flat_id:
        raise HTTPException(status_code=400, detail="No flat assigned to this user")
    return db.query(models.FrequentVisitor).filter(
        models.FrequentVisitor.flat_id == current_user.flat_id,
        models.FrequentVisitor.is_active == True
    ).all()

# ─── Add frequent visitor ────────────────────────────────
@router.post("/frequent", response_model=schemas.FrequentVisitorOut)
def add_frequent_visitor(
    payload: schemas.FrequentVisitorCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not current_user.flat_id:
        raise HTTPException(status_code=400, detail="No flat assigned to this user")

    frequent = models.FrequentVisitor(
        name=payload.name,
        phone=payload.phone,
        purpose=payload.purpose,
        flat_id=current_user.flat_id,
        added_by=current_user.id
    )
    db.add(frequent)
    db.commit()
    db.refresh(frequent)
    return frequent

# ─── Delete frequent visitor ─────────────────────────────
@router.delete("/frequent/{frequent_id}")
def delete_frequent_visitor(
    frequent_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    frequent = db.query(models.FrequentVisitor).filter(
        models.FrequentVisitor.id == frequent_id,
        models.FrequentVisitor.flat_id == current_user.flat_id
    ).first()

    if not frequent:
        raise HTTPException(status_code=404, detail="Frequent visitor not found")

    frequent.is_active = False
    db.commit()
    return {"message": "Frequent visitor removed"}

# ─── Quick approve from WhatsApp link ───────────────────
@router.get("/{visitor_id}/{action}")
def quick_respond(
    visitor_id: int,
    action: str,
    db: Session = Depends(get_db)
):
    if action not in ["approved", "denied"]:
        raise HTTPException(status_code=400, detail="Invalid action")

    visitor = db.query(models.Visitor).filter(
        models.Visitor.id == visitor_id
    ).first()

    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")

    if visitor.status != models.VisitorStatus.pending:
        return {"message": f"Already {visitor.status}"}

    visitor.status = models.VisitorStatus.approved if action == "approved" else models.VisitorStatus.denied
    db.commit()

    if action == "approved":
        return {"message": f"✅ {visitor.name} has been allowed entry"}
    else:
        return {"message": f"❌ {visitor.name} has been denied entry"}