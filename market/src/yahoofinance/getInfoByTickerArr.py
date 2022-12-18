import yfinance as yf
import sys
import json

def getInfoByTickerArr(ticker):
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
                'args':e.args
            }
        }))

if __name__ == "__main__":
    getInfoByTickerArr(sys.argv[1])