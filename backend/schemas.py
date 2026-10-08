from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

from models import UserRole, VisitorStatus


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8)
    phone: Optional[str] = Field(default=None, max_length=20)
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


class SocietyCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    address: Optional[str] = Field(default=None, max_length=255)


class SocietyOut(BaseModel):
    id: int
    name: str
    address: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class FlatCreate(BaseModel):
    flat_number: str = Field(min_length=1, max_length=30)
    floor: Optional[str] = Field(default=None, max_length=30)
    society_id: int


class FlatOut(BaseModel):
    id: int
    flat_number: str
    floor: Optional[str]
    society_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class VisitorCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    phone: Optional[str] = Field(default=None, max_length=20)
    purpose: str = Field(min_length=2, max_length=255)
    vehicle_number: Optional[str] = Field(default=None, max_length=30)
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


class FrequentVisitorCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    phone: Optional[str] = Field(default=None, max_length=20)
    purpose: str = Field(min_length=2, max_length=255)
    flat_id: Optional[int] = None


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
