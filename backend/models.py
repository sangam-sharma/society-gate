from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
import enum

class UserRole(str, enum.Enum):
    admin = "admin"
    resident = "resident"
    guard = "guard"

class VisitorStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    denied = "denied"
    exited = "exited"

class Society(Base):
    __tablename__ = "societies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    address = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    flats = relationship("Flat", back_populates="society")

class Flat(Base):
    __tablename__ = "flats"

    id = Column(Integer, primary_key=True, index=True)
    flat_number = Column(String, nullable=False)
    floor = Column(String)
    society_id = Column(Integer, ForeignKey("societies.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    society = relationship("Society", back_populates="flats")
    residents = relationship("User", back_populates="flat")
    visitors = relationship("Visitor", back_populates="flat")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    phone = Column(String)
    role = Column(Enum(UserRole), default=UserRole.resident)
    flat_id = Column(Integer, ForeignKey("flats.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    flat = relationship("Flat", back_populates="residents")

class Visitor(Base):
    __tablename__ = "visitors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String)
    purpose = Column(String)
    vehicle_number = Column(String, nullable=True)
    photo_url = Column(String, nullable=True)
    status = Column(Enum(VisitorStatus), default=VisitorStatus.pending)
    flat_id = Column(Integer, ForeignKey("flats.id"))
    entry_time = Column(DateTime, default=datetime.utcnow)
    exit_time = Column(DateTime, nullable=True)
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    flat = relationship("Flat", back_populates="visitors")

class FrequentVisitor(Base):
    __tablename__ = "frequent_visitors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String)
    purpose = Column(String)
    flat_id = Column(Integer, ForeignKey("flats.id"))
    added_by = Column(Integer, ForeignKey("users.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)