from typing import Union
from fastapi import FastAPI
from pydantic import BaseModel
import os
import yfinance as yf
import exchange_calendars as xcals
from datetime import datetime
import warnings

warnings.simplefilter(action='ignore', category=FutureWarning) # FutureWarning 제거

class Body(BaseModel):
    ticker: Union[str, None] = None
    ISO_Code: Union[str, None] = None


app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "Welcome to the PFA's Get Market API"}

@app.post("/yf/info/")
def get_info_by_ticker(body: Body):
    ticker = body.ticker
    print(ticker, os.getpid())
    try:
        Ticker = yf.Ticker(ticker)
        Ticker.fast_info.currency # 잘못된 티커 빠르게 에러던지기 위한
        try:
            raise Exception("info") # 성능상 info 건너뛰기
            info = Ticker.info
        except:
            info = {"symbol": None}
        
        if info["symbol"]:
            return info
        else:
            fastinfo = Ticker.fast_info
            price = getPrice(Ticker)
            metadata = Ticker.get_history_metadata()
            return {
                "info": info,
                "fastinfo": {
                    "currency": fastinfo["currency"],
                    "exchange": fastinfo["exchange"],
                    "quoteType": fastinfo["quoteType"]
                },
                "price": price,
                "metadata": {
                    "symbol": metadata["symbol"],
                    "instrumentType": metadata["instrumentType"],
                    "exchangeTimezoneShortName": metadata["timezone"],
                    "exchangeTimezoneName": metadata["exchangeTimezoneName"]
                }
            }
    except Exception as e:
        return {
            'error': {
                'doc': e.__doc__,
                "ticker": ticker,
                'args':e.args
            }
        }

@app.post("/yf/price/")
def get_price_by_ticker(body: Body):
    ticker = body.ticker
    print(ticker, os.getpid())
    try:
        price = getPrice(yf.Ticker(ticker))
        return price
    except Exception as e:
        return {
            'error': {
                'doc': e.__doc__,
                "ticker": ticker,
                'args':e.args
            }
        }

@app.post("/ec/session/")
def get_session_by_ISOcode(body: Body):
    ISO_Code = body.ISO_Code
    print(ISO_Code, os.getpid())
    try:
        cd = xcals.get_calendar(ISO_Code)
        return {
            "previous_open": cd.previous_open(datetime.utcnow()).isoformat(),
            "previous_close": cd.previous_close(datetime.utcnow()).isoformat(),
            "next_open": cd.next_open(datetime.utcnow()).isoformat(),
            "next_close": cd.next_close(datetime.utcnow()).isoformat(),
        }
    except Exception as e:
        return {
            'error': {
                'doc': e.__doc__,
                "ISO_Code": ISO_Code,
            }
        }

def getPrice(Ticker: yf.Ticker):
    priceChart = Ticker.history(period="7d")
    return {
        "regularMarketPrice": priceChart['Close'][-1],
        "regularMarketPreviousClose": priceChart['Close'][-2]
    }