# python 3.8.15
# yfinance lts

import yfinance as yf
import sys
import json
import warnings

warnings.filterwarnings('ignore')

def get_price_by_ticker(ticker):
    try:
        print(json.dumps(getPrice(yf.Ticker(ticker))))
    except Exception as e:
        print(json.dumps({
            'error': {
                'doc': e.__doc__,
                "ticker": ticker,
                'args':e.args
            }
        }))

def getPrice(Ticker: yf.Ticker):
    priceChart = Ticker.history(period="7d")
    return {
        "regularMarketPrice": priceChart['Close'][-1],
        "regularMarketPreviousClose": priceChart['Close'][-2]
    }

if __name__ == "__main__":
    get_price_by_ticker(sys.argv[1])