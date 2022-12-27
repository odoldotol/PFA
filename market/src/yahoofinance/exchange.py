import exchange_calendars as xcals
import json
from datetime import datetime
import warnings

warnings.simplefilter(action='ignore', category=FutureWarning) # FutureWarning 제거

# t = xcals.get_calendar("XNYS")
# k = xcals.get_calendar("XKRX")
# j = xcals.get_calendar("XTKS")

# print(json.dumps(datetime.utcnow().isoformat()))

# print(json.dumps(t.name))
# print(json.dumps(t.previous_open(datetime.utcnow()).isoformat()))
# print(t.previous_close(datetime.utcnow()))
# print(t.next_open(datetime.utcnow()))
# print(t.next_close(datetime.utcnow()))
# print(t.schedule.index[-1])
# print(t.schedule.index[-2])
# print(t.schedule.index[-3])

# print(k.name)
# print(k.previous_open(datetime.utcnow()))
# print(k.previous_close(datetime.utcnow()))
# print(k.next_open(datetime.utcnow()))
# print(k.next_close(datetime.utcnow()))
# print(k.schedule.index[-1])
# print(k.schedule.index[-2])
# print(k.schedule.index[-3])

# print(j.name)
# print(j.previous_open(datetime.utcnow()))
# print(j.previous_close(datetime.utcnow()))
# print(j.next_open(datetime.utcnow()))
# print(j.next_close(datetime.utcnow()))
# print(j.schedule.index[-1])
# print(j.schedule.index[-2])
# print(j.schedule.index[-3])

ISO_Code = "XKRX"

try:
    cd = xcals.get_calendar(ISO_Code)
    print(json.dumps({ # 성공하면 아래 dic 출력
        "previous_open": cd.previous_open(datetime.utcnow()).isoformat(),
        "previous_close": cd.previous_close(datetime.utcnow()).isoformat(),
        "next_open": cd.next_open(datetime.utcnow()).isoformat(),
        "next_close": cd.next_close(datetime.utcnow()).isoformat(),
    }))
except Exception as e:
    print(json.dumps({ # 실패하면 error 객체 만들어서 출력
        'error': {
            'doc': e.__doc__,
            "ISO_Code": ISO_Code,
        }
    }))