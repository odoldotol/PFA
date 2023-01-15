from fastapi import FastAPI

import yfinance as yf
import exchange_calendars as xcals
from datetime import datetime
import warnings

warnings.simplefilter(action='ignore', category=FutureWarning) # FutureWarning 제거

app = FastAPI()


@app.get("/")
async def read_root():
    return {"Hello": "Welcome to the PFA's Get Market API"}

@app.get("/yf/info")
async def get_info_by_ticker(ticker):
    try:
        info = yf.Ticker(ticker).info
        if info['symbol'] == ticker:
            return info # 성공하면 info 출력
        else:
            return {
                "error": "Symbol is not equal to a ticker",
                "ticker": ticker,
                "symbol": info['symbol']
            }
    except Exception as e:
        return { # 실패하면 error 객체 만들어서 출력
            'error': {
                'doc': e.__doc__,
                "ticker": ticker,
                'args':e.args
            }
        }

@app.get("/yf/price")
async def get_price_by_ticker(ticker):
    try:
        priceChart = yf.Ticker(ticker).history(period="7d") # BTC-USD 등 에서 누락되는 경우 발견, 안전하게 7일치 가져와서 마지막 2일을 담자
        regularMarketPrice = priceChart['Close'][-1]
        regularMarketPreviousClose = priceChart['Close'][-2]
        price = {
            "regularMarketPrice": regularMarketPrice,
            "regularMarketPreviousClose": regularMarketPreviousClose
        }
        return price # 성공하면 price 출력
    except Exception as e:
        return { # 실패하면 error 객체 만들어서 출력
            'error': {
                'doc': e.__doc__,
                "ticker": ticker,
                'args':e.args
            }
        }

@app.get("/ec/session")
async def get_session_by_ISOcode(ISO_Code):
    try:
        cd = xcals.get_calendar(ISO_Code)
        return { # 성공하면 아래 dic 출력
            "previous_open": cd.previous_open(datetime.utcnow()).isoformat(),
            "previous_close": cd.previous_close(datetime.utcnow()).isoformat(),
            "next_open": cd.next_open(datetime.utcnow()).isoformat(),
            "next_close": cd.next_close(datetime.utcnow()).isoformat(),
        }
    except Exception as e:
        return { # 실패하면 error 객체 만들어서 출력
            'error': {
                'doc': e.__doc__,
                "ISO_Code": ISO_Code,
            }
        }