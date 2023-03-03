# python 3.8.15
# yfinance lts

import yfinance as yf
import sys
import json
import warnings

warnings.filterwarnings('ignore')

def get_info_by_ticker(ticker):
    try:
        Ticker = yf.Ticker(ticker)
        try:
            info = Ticker.info
        except:
            info = {"symbol": None}

        if info["symbol"]:
            print(json.dumps(info))
        else:
            fastinfo = Ticker.fast_info
            priceChart = Ticker.history(period="7d")
            regularMarketPrice = priceChart['Close'][-1]
            regularMarketPreviousClose = priceChart['Close'][-2]
            price = {
                "regularMarketPrice": regularMarketPrice,
                "regularMarketPreviousClose": regularMarketPreviousClose
            }
            metadata = Ticker.get_history_metadata()
            print(json.dumps({"info": info, "fastinfo": fastinfo, "price": price, "metadata": metadata}))
    except Exception as e:
        print(json.dumps({ # 실패하면 error 객체 만들어서 출력
            'error': {
                'doc': e.__doc__,
                "ticker": ticker,
                'args':e.args
            }
        }))

if __name__ == "__main__":
    get_info_by_ticker(sys.argv[1])