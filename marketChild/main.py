import logging
from typing import List, Union
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import ResponseValidationError
from fastapi.responses import JSONResponse
from pandas import DataFrame
from pydantic import BaseModel
# import os
import yfinance as yf
import exchange_calendars as xcals
from datetime import datetime
import warnings

warnings.simplefilter(action='ignore', category=FutureWarning)

class HealthCheckFilter(logging.Filter):
  def filter(self, record: logging.LogRecord) -> bool:
    return record.getMessage().find("GET /health HTTP/1.1\" 200") == -1

# Filter out /endpoint
logging.getLogger("uvicorn.access").addFilter(HealthCheckFilter())

class Price(BaseModel):
  regularMarketPrice: float
  regularMarketPreviousClose: float

class Info(BaseModel):
  info: Union[dict, None] = None
  metadata: dict
  fastinfo: Union[dict, None] = None
  price: Price

class Session(BaseModel):
  previous_open: str
  previous_close: str
  next_open: str
  next_close: str

class Infos(BaseModel):
  infos: List[Info]
  exceptions: list

app = FastAPI(
  title="Market Child API",
  description="Yahoo Finance API, Exchange Calendar API",
)

def uppercase_ticker_validation_pipe(
  ticker: Union[str, List[str]]
) -> Union[str, List[str]]:
  """
  fastapi 에서 제공하는 더 우아한 방법이 있을텐데?
  """
  if isinstance(ticker, str):
    return ticker.upper()
  return [t.upper() for t in ticker]

@app.exception_handler(ResponseValidationError)
async def response_validation_exception_handler(_, exc):
  return JSONResponse(
    status_code=500,
    content = {
      "error": "ResponseValidationError",
      "detail": str(exc)
    },
  )

@app.exception_handler(HTTPException)
async def http_exception_handler(_, exc: HTTPException):
  return JSONResponse(
    status_code=exc.status_code,
    content = exc.detail,
  )

@app.exception_handler(Exception)
async def unexpected_exception_handler(request: Request, exc: Exception):
  return JSONResponse(
    status_code=500,
    content = {
    "error": "InternalServerError",
    "message": exc.__doc__,
    "detail": str(exc),
    "ticker": request.path_params['ticker'] if 'ticker' in request.path_params else None,
    "iso_code": request.path_params['ISO_Code'] if 'ISO_Code' in request.path_params else None,
    }
  )

@app.get(
  "/health",
  description="Health Check"
)
def health_check():
  return {"status": "ok"}

@app.post(
  "/yf/info",
  tags=["Asset"],
  description="Yahoo Finance API Infos",
  response_model=Infos
)
def get_infos_by_tickers(tickers: List[str]) -> Infos:
  # print(tickers, os.getpid())
  tickers = uppercase_ticker_validation_pipe(tickers)

  yf_tickers = yf.Tickers(' '.join(tickers))

  result: Infos = {
    "infos": [],
    "exceptions": []
  }

  for ticker in tickers:
    yf_ticker = yf_tickers.tickers[ticker]

    try:
      result["infos"].append(get_info_by_yf_ticker(yf_ticker))
    except HTTPException as e:
      result["exceptions"].append({
        "status_code": e.status_code,
        "detail": e.detail,
      })
  
  return result

@app.post(
  "/yf/info/{ticker}",
  tags=["Asset"],
  description="Yahoo Finance API Info",
  response_model=Info
)
def get_info_by_ticker(ticker: str) -> Info:
  # print(ticker, os.getpid())
  ticker = uppercase_ticker_validation_pipe(ticker)

  return get_info_by_yf_ticker(get_yf_ticker(ticker))

@app.post(
  "/yf/price/{ticker}",
  tags=["Asset"],
  description="Yahoo Finance API Price",
  response_model=Price
)
def get_price_by_ticker(ticker: str) -> Price:
  # print(ticker, os.getpid())
  ticker = uppercase_ticker_validation_pipe(ticker)

  return get_price_if_exist(get_yf_ticker(ticker))

@app.post(
  "/ec/session/{ISO_Code}",
  tags=["Exchange Session"],
  description="Exchange Calendar API",
  response_model=Session
)
def get_session_by_ISOcode(ISO_Code: str) -> Session:
  # print(ISO_Code, os.getpid())
  ISO_Code = uppercase_ticker_validation_pipe(ISO_Code)

  cd = xcals.get_calendar(ISO_Code)
  return {
    "previous_open": cd.previous_open(datetime.utcnow()).isoformat(),
    "previous_close": cd.previous_close(datetime.utcnow()).isoformat(),
    "next_open": cd.next_open(datetime.utcnow()).isoformat(),
    "next_close": cd.next_close(datetime.utcnow()).isoformat(),
  }

def get_info_by_yf_ticker(yf_ticker: yf.Ticker) -> Info:
  result = {}
  result["price"] = get_price_if_exist(yf_ticker)

  # Todo: refac
  fast_info = yf_ticker.fast_info
  fast_info.currency # 이게 없으면 metadata.tradingPeriods 생기고 이를 Pydantic 에서 Serialization 못하면서 PydanticSerializationError 발생해서 최종적으로 Exception in ASGI application 으로 500 응답해버리는것 같음. 추후 이를 해결하기.

  # info 에 접근할 수 없는 경우가 종종 생기는데 이는 최대한 빠르게 고쳐야함. 그동안은 임시로 fast_info 사용함.
  try:
    result["info"] = yf_ticker.info
  except:
    result["fastinfo"] = {}
    for i in fast_info: # lazy loading ResponseValidationError 조치
      v = fast_info[i]
      if is_nan(v): # nan 조치
        v = None
      result["fastinfo"][i] = v

  result["metadata"] = yf_ticker.history_metadata

  return result

def get_price_if_exist(yf_ticker: yf.Ticker) -> Price:
  """
  ### 존재하지 않는 ticker 404 던짐

  최근 5일간의 기록이 없다면 존재하지 않는 ticker 로 판단
  """
  price_chart = yf_ticker.history(period="5d")
  if is_empty(price_chart):
    raise HTTPException(404, {
      "error": "NotFoundError",
      "message": "Ticker not found",
      "ticker": yf_ticker.ticker,
    })

  return {
    "regularMarketPrice": price_chart['Close'][-1],
    "regularMarketPreviousClose": price_chart['Close'][-2]
  }

def get_yf_ticker(ticker: str) -> yf.Ticker:
  return yf.Ticker(ticker)

def is_empty(price_chart: DataFrame) -> bool:
  return price_chart.empty

def is_nan(num: any) -> bool:
  return type(num) == float and num != num