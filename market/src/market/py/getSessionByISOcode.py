# python 3.8.15
# exchange_calendars lts

import exchange_calendars as xcals
import sys
import json
from datetime import datetime
import warnings

warnings.filterwarnings('ignore')

def get_session_by_ISOcode(ISO_Code):
    try:
        cd = xcals.get_calendar(ISO_Code)
        print(json.dumps({
            "previous_open": cd.previous_open(datetime.utcnow()).isoformat(),
            "previous_close": cd.previous_close(datetime.utcnow()).isoformat(),
            "next_open": cd.next_open(datetime.utcnow()).isoformat(),
            "next_close": cd.next_close(datetime.utcnow()).isoformat(),
        }))
    except Exception as e:
        print(json.dumps({
            'error': {
                'doc': e.__doc__,
                "ISO_Code": ISO_Code,
            }
        }))

if __name__ == "__main__":
    get_session_by_ISOcode(sys.argv[1])