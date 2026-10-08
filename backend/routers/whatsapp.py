import logging
import os

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from twilio.rest import Client

from auth import require_admin
import models

load_dotenv()

logger = logging.getLogger(__name__)
router = APIRouter()

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_WHATSAPP_FROM = os.getenv("TWILIO_WHATSAPP_FROM")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")


def send_whatsapp_notification(
    to_phone: str,
    visitor_name: str,
    purpose: str,
    flat_number: str,
    visitor_id: int,
):
    if not all([TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM]):
        logger.warning("Twilio is not configured; skipping WhatsApp notification")
        return

    try:
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        dashboard_link = f"{FRONTEND_URL}/resident"

        message = (
            "🔔 *Visitor at Gate*\n\n"
            f"*Name:* {visitor_name}\n"
            f"*Purpose:* {purpose}\n"
            f"*Flat:* {flat_number}\n\n"
            f"Open the resident dashboard to review request: {dashboard_link}\n\n"
            "_Society Gate Management_"
        )

        client.messages.create(
            from_=TWILIO_WHATSAPP_FROM,
            to=f"whatsapp:+91{to_phone}",
            body=message,
        )
        logger.info("WhatsApp notification sent for visitor %s", visitor_id)
    except Exception:
        logger.exception("WhatsApp notification failed for visitor %s", visitor_id)


@router.post("/test")
def test_whatsapp(
    phone: str,
    current_user: models.User = Depends(require_admin),
):
    if not all([TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM]):
        raise HTTPException(status_code=503, detail="Twilio is not configured")

    try:
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        client.messages.create(
            from_=TWILIO_WHATSAPP_FROM,
            to=f"whatsapp:+91{phone}",
            body="✅ Society Gate WhatsApp is working!",
        )
        return {"message": "WhatsApp test message sent"}
    except Exception:
        logger.exception("WhatsApp test message failed")
        raise HTTPException(status_code=502, detail="WhatsApp provider request failed")
