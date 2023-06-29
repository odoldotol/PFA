import logging
from typing import Union
from fastapi import FastAPI
from pydantic import BaseModel
import os
import yfinance as yf
import exchange_calendars as xcals
from datetime import datetime
import warnings

warnings.simplefilter(action='ignore', category=FutureWarning) # FutureWarning 제거

class HealthCheckFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        return record.getMessage().find("GET /health HTTP/1.1\" 200") == -1

# Filter out /endpoint
logging.getLogger("uvicorn.access").addFilter(HealthCheckFilter())

class Price(BaseModel):
    regularMarketPrice: float
    regularMarketPreviousClose: float

class R_Info(BaseModel):
    info: dict
    metadata: Union[dict, None]
    fastinfo: Union[dict, None]
    price: Union[Price, None]

class R_Session(BaseModel):
    previous_open: str
    previous_close: str
    next_open: str
    next_close: str

class R_Error(BaseModel): # Refac: 그냥 에러를 던지도록 하기
    error: dict

app = FastAPI(
    title="Market Child API",
    description="Yahoo Finance API, Exchange Calendar API",
)

@app.get("/health", tags=["Health Check"], description="Health Check")
def health_check():
    return {"status": "ok"}

@app.post("/yf/info/{ticker}", tags=["Asset Info"], description="Yahoo Finance API Info", response_model=Union[R_Info, R_Error])
def get_info_by_ticker(ticker: str) -> Union[R_Info, R_Error]:
    print(ticker, os.getpid())
    result = {}
    try:
        Ticker = yf.Ticker(ticker)
        Ticker.fast_info.currency # 잘못된 티커 빠르게 에러던지기 위한
        try:
            # raise Exception("info") # 성능상 info 건너뛰기
            info = Ticker.info
            metadata = Ticker.get_history_metadata()
        except:
            info = {"symbol": None}
        
        result["info"] = info
        result["metadata"] = metadata

        if info["symbol"]:
            return result
        else:
            fastinfo = Ticker.fast_info
            price = getPrice(Ticker)
            result["fastinfo"] = fastinfo
            result["price"] = price
            return result

    except Exception as e:
        return {
            'error': {
                'doc': e.__doc__,
                "ticker": ticker,
                'args':e.args
            }
        }

@app.post("/yf/price/{ticker}", tags=["Price"], description="Yahoo Finance API Price", response_model=Union[Price, R_Error])
def get_price_by_ticker(ticker) -> Union[Price, R_Error]:
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

@app.post("/ec/session/{ISO_Code}", tags=["Exchange Session"], description="Exchange Calendar API", response_model=Union[R_Session, R_Error])
def get_session_by_ISOcode(ISO_Code) -> Union[R_Session, R_Error]:
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

def getPrice(Ticker: yf.Ticker) -> Price:
    priceChart = Ticker.history(period="7d")
    return {
        "regularMarketPrice": priceChart['Close'][-1],
        "regularMarketPreviousClose": priceChart['Close'][-2]
    }