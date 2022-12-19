import exchange_calendars as xcals
import json
from datetime import datetime


print(json.dumps(xcals.get_calendar_names(include_aliases=False)))
t = xcals.get_calendar("XNYS")
k = xcals.get_calendar("XKRX")
j = xcals.get_calendar("XTKS")
print(datetime.utcnow())
print(t.name)
print(t.previous_open(datetime.utcnow()))
print(t.previous_close(datetime.utcnow()))
print(t.next_open(datetime.utcnow()))
print(t.next_close(datetime.utcnow()))
print(k.name)
print(k.previous_open(datetime.utcnow()))
print(k.previous_close(datetime.utcnow()))
print(k.next_open(datetime.utcnow()))
print(k.next_close(datetime.utcnow()))
print(j.name)
print(j.previous_open(datetime.utcnow()))
print(j.previous_close(datetime.utcnow()))
print(j.next_open(datetime.utcnow()))
print(j.next_close(datetime.utcnow()))