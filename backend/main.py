from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
import models  # noqa: F401 - registers SQLAlchemy models
from routers import auth, visitors, residents, admin, whatsapp

# Keep automatic table creation for this standalone demo project.
# A production deployment should replace this with Alembic migrations.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Society Gate Management",
    description="API for managing visitor entry and approval in a residential society",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(visitors.router, prefix="/visitors", tags=["Visitors"])
app.include_router(residents.router, prefix="/residents", tags=["Residents"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(whatsapp.router, prefix="/whatsapp", tags=["WhatsApp"])


@app.get("/")
def root():
    return {"message": "Society Gate API is running"}
