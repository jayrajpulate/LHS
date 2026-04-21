from datetime import datetime
from zoneinfo import ZoneInfo

IST_TZ = ZoneInfo("Asia/Kolkata")

def get_ist_now() -> datetime:
    """Returns the current naive datetime in Indian Standard Time (IST)."""
    # Create an aware datetime in IST, then remove the timezone info to store as naive
    # This ensures it matches the DateTime columns in the database.
    return datetime.now(IST_TZ).replace(tzinfo=None)
