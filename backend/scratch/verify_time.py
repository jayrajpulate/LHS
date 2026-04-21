from app.core.timezone import get_ist_now
from datetime import datetime, timezone

ist_now = get_ist_now()
utc_now = datetime.now(timezone.utc)

print(f"Current IST (naive): {ist_now}")
print(f"Current UTC (aware): {utc_now}")
# IST is UTC + 5:30
# Difference should be approx 5.5 hours
