# python 3.8.15
# yfinance lts

import yfinance as yf
import sys
import json

def get_price_by_ticker(ticker):
    try:
        priceChart = yf.Ticker(ticker).history(period="7d") # BTC-USD 등 에서 누락되는 경우 발견, 안전하게 7일치 가져와서 마지막 2일을 담자
        regularMarketPrice = priceChart['Close'][-1]
        regularMarketPreviousClose = priceChart['Close'][-2]
        price = {
            "regularMarketPrice": regularMarketPrice,
            "regularMarketPreviousClose": regularMarketPreviousClose
        }
        print(json.dumps(price)) # 성공하면 price 출력
    except Exception as e:
        print(json.dumps({ # 실패하면 error 객체 만들어서 출력
            'error': {
                'doc': e.__doc__,
                "ticker": ticker,
                'args':e.args
            }
        }))

if __name__ == "__main__":
    get_price_by_ticker(sys.argv[1])