# python 3.8.15
# exchange_calendars lts

import exchange_calendars as xcals
import sys
import json
from datetime import datetime
import warnings

warnings.simplefilter(action='ignore', category=FutureWarning) # FutureWarning 제거

def get_session_by_ISOcode(ISO_Code):
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

if __name__ == "__main__":
    get_session_by_ISOcode(sys.argv[1])