# python 3.8.15
# yfinance lts

import yfinance as yf
import sys
import json

def get_info_by_ticker(ticker):
    try:
        info = yf.Ticker(ticker).info
        if info['symbol'] == ticker:
            print(json.dumps(info)) # 성공하면 info 출력
        else:
            print(json.dumps({
                "error": "Symbol is not equal to a ticker",
                "ticker": ticker,
                "symbol": info['symbol']
            }))
    except Exception as e:
        print(json.dumps({ # 실패하면 error 객체 만들어서 출력
            'error': {
                'doc': e.__doc__,
                "ticker": ticker,
                # 'args':e.args
            }
        }))

if __name__ == "__main__":
    get_info_by_ticker(sys.argv[1])