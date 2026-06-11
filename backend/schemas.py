from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from models import UserRole, VisitorStatus

# ─── Auth ───────────────────────────────────────────────
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    role: UserRole = UserRole.resident
    flat_id: Optional[int] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    role: UserRole
    flat_id: Optional[int]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    role: UserRole
    user_id: int
    flat_id: Optional[int]

# ─── Society ────────────────────────────────────────────
class SocietyCreate(BaseModel):
    name: str
    address: Optional[str] = None

class SocietyOut(BaseModel):
    id: int
    name: str
    address: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# ─── Flat ───────────────────────────────────────────────
class FlatCreate(BaseModel):
    flat_number: str
    floor: Optional[str] = None
    society_id: int

class FlatOut(BaseModel):
    id: int
    flat_number: str
    floor: Optional[str]
    society_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ─── Visitor ────────────────────────────────────────────
class VisitorCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    purpose: str
    vehicle_number: Optional[str] = None
    flat_id: int

class VisitorOut(BaseModel):
    id: int
    name: str
    phone: Optional[str]
    purpose: str
    vehicle_number: Optional[str]
    photo_url: Optional[str]
    status: VisitorStatus
    flat_id: int
    entry_time: datetime
    exit_time: Optional[datetime]
    approved_by: Optional[int]

    class Config:
        from_attributes = True

class VisitorStatusUpdate(BaseModel):
    status: VisitorStatus

# ─── Frequent Visitor ───────────────────────────────────
class FrequentVisitorCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    purpose: str
    flat_id: int

class FrequentVisitorOut(BaseModel):
    id: int
    name: str
    phone: Optional[str]
    purpose: str
    flat_id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True