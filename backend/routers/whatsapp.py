from fastapi import APIRouter
from twilio.rest import Client
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_WHATSAPP_FROM = os.getenv("TWILIO_WHATSAPP_FROM")

BASE_URL = "http://localhost:5173"

def send_whatsapp_notification(
    to_phone: str,
    visitor_name: str,
    purpose: str,
    flat_number: str,
    visitor_id: int
):
    try:
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

        approve_link = f"{BASE_URL}/approve/{visitor_id}/approved"
        deny_link = f"{BASE_URL}/approve/{visitor_id}/denied"

        message = (
            f"🔔 *Visitor at Gate*\n\n"
            f"*Name:* {visitor_name}\n"
            f"*Purpose:* {purpose}\n"
            f"*Flat:* {flat_number}\n\n"
            f"✅ Approve: {approve_link}\n"
            f"❌ Deny: {deny_link}\n\n"
            f"_Society Gate Management_"
        )

        client.messages.create(
            from_=TWILIO_WHATSAPP_FROM,
            to=f"whatsapp:+91{to_phone}",
            body=message
        )

        print(f"WhatsApp sent to {to_phone}")

    except Exception as e:
        print(f"WhatsApp error: {e}")


# ─── Test WhatsApp route ─────────────────────────────────
@router.post("/test")
def test_whatsapp(phone: str):
    try:
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        client.messages.create(
            from_=TWILIO_WHATSAPP_FROM,
            to=f"whatsapp:+91{phone}",
            body="✅ Society Gate WhatsApp is working!"
        )
        return {"message": f"WhatsApp sent to {phone}"}
    except Exception as e:
        return {"error": str(e)}