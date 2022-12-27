# python 3.10.4
# yfinance 

import yfinance as yf
import sys
import json

def get_price_by_ticker(ticker):
    try:
        price = yf.Ticker(ticker).history(period="1d")['Close'][0]
        print(json.dumps(price)) # 성공하면 price 출력
    except Exception as e:
        print(json.dumps({ # 실패하면 error 객체 만들어서 출력
            'error': {
                'doc': e.__doc__,
                "ticker": ticker,
                # 'args':e.args
            }
        }))

if __name__ == "__main__":
    get_price_by_ticker(sys.argv[1])