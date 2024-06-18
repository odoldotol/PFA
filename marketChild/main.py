import asyncio
from concurrent.futures import ThreadPoolExecutor
from enum import Enum
import logging
import resource
from typing import List, Union
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import ResponseValidationError
from fastapi.responses import JSONResponse
from pandas import DataFrame
from pydantic import BaseModel
import os
import yfinance as yf
import exchange_calendars as xcals
from datetime import datetime
import warnings
# from time_test import start_time_test, end_time_test

# Todo: 디자인패턴, 모듈화, ...

################################ CONFIG ######################################

class PriceRequestStrategy(Enum):
  SINGLE = "single"
  MULTI = "multi" # default

CONCURRENCY_DEFAULT = 250

load_dotenv(os.path.join(
  os.path.dirname(os.path.abspath(__file__)),
  ".env.market"
))

# CONCURRENCY
CONCURRENCY = os.getenv("CHILD_CONCURRENCY")
if CONCURRENCY is not None:
  CONCURRENCY = int(CONCURRENCY)
else:
  CONCURRENCY = CONCURRENCY_DEFAULT

# PRICE_REQUEST_STRATEGY (default: PriceRequestStrategy.MULTI)
PRICE_REQUEST_STRATEGY = os.getenv("PRICE_REQUEST_STRATEGY")
if PRICE_REQUEST_STRATEGY != PriceRequestStrategy.SINGLE.value:
  PRICE_REQUEST_STRATEGY = PriceRequestStrategy.MULTI.value

# THREAD_POOL_EXECUTOR_MAX_WORKERS_DEFAULT
if PRICE_REQUEST_STRATEGY == PriceRequestStrategy.SINGLE.value:
  THREAD_POOL_EXECUTOR_MAX_WORKERS_DEFAULT = CONCURRENCY
else:
  THREAD_POOL_EXECUTOR_MAX_WORKERS_DEFAULT = 5000

# THREAD_POOL_EXECUTOR_MAX_WORKERS
THREAD_POOL_EXECUTOR_MAX_WORKERS = os.getenv("CHILD_THREAD_POOL_EXECUTOR_MAX_WORKERS")
if THREAD_POOL_EXECUTOR_MAX_WORKERS is not None:
  THREAD_POOL_EXECUTOR_MAX_WORKERS = int(THREAD_POOL_EXECUTOR_MAX_WORKERS)
else:
  THREAD_POOL_EXECUTOR_MAX_WORKERS = THREAD_POOL_EXECUTOR_MAX_WORKERS_DEFAULT

if PRICE_REQUEST_STRATEGY == PriceRequestStrategy.SINGLE.value:
  THREAD_POOL_EXECUTOR_MAX_WORKERS = max(THREAD_POOL_EXECUTOR_MAX_WORKERS, CONCURRENCY)

# ThreadPoolExecutor
executor = ThreadPoolExecutor(THREAD_POOL_EXECUTOR_MAX_WORKERS)
print(f"THREAD_POOL_EXECUTOR_MAX_WORKERS: {THREAD_POOL_EXECUTOR_MAX_WORKERS}")

def calculate_rlimit_nofile_soft(
  concurrency: int,
  threadpool_maxworkers: int,
  price_request_strategy: str = PRICE_REQUEST_STRATEGY
) -> int:
  """
  ### 실험적으로 근사치를 계산.
  - 최소 30 필요. (1개의 자산 처리)
  - 이후 처리량에 따라 증가.

  #### 처리량에 따른 증가량 계산법은 PRICE_REQUEST_STRATEGY 에 따라서 다름.
  - single: POST yf/price/{ticker} - CONCURRENCY 가 곧 한번에 받을 요청수 = 한번에 처리할 자산의 수.
    - 처리량 2000 까지, 최소 4n 즉, 4 * CONCURRENCY 가 필요함을 실험적으로 확인.

  - multi: POST yf/price - THREAD_POOL_EXECUTOR_MAX_WORKERS 가 곧 한번에 처리할 자산의 수 가 됨.
    - 비동기적으로 리소스를 해제하기때문에 비 선형적이고 처리량이 많을 수록 자산당 필요한 리소스가 줄어듦.
    - 실험적으로 근사치를 가지는 수식을 사용.
    - 처리량 2000 까지 대략 (n + 4000 / n + 1000) * n 가 필요함을 실험적으로 확인.

  ##### 구현에 따라 달라질 수 있음
  ##### 자세한 정보는 Price Update 최적화 문서의 MarketChild 최적화 부분을 참고.
  """
  # 현 배포환경 하드캡을 30,000 정도로 생각한다. 일단, 그 아래 규모에서는 좀 더 여유롭게 계산하자.
  min_start = 50
  if price_request_strategy == PriceRequestStrategy.SINGLE.value:
    amount = concurrency
    multiple = 7
  else:
    amount = threadpool_maxworkers
    multiple = amount + 4000 / amount + 1000
  return min_start + (multiple * amount)

rlimit_nofile_soft = calculate_rlimit_nofile_soft(
  CONCURRENCY,
  THREAD_POOL_EXECUTOR_MAX_WORKERS,
  PRICE_REQUEST_STRATEGY
)
rlimit_nofile_hard_org = resource.getrlimit(resource.RLIMIT_NOFILE)[1]

# RLIMIT_NOFILE_HARD 을 넘진 않도록
if rlimit_nofile_hard_org < rlimit_nofile_soft:
  rlimit_nofile_soft = rlimit_nofile_hard_org
  warnings.warn(f"RLIMIT_NOFILE_SOFT is set to {rlimit_nofile_soft} because RLIMIT_NOFILE_SOFT must not exceed RLIMIT_NOFILE_HARD.")

# set RLIMIT_NOFILE_SOFT
resource.setrlimit(resource.RLIMIT_NOFILE, (
  rlimit_nofile_soft,
  rlimit_nofile_hard_org
))

print(f"RLIMIT_NOFILE: {resource.getrlimit(resource.RLIMIT_NOFILE)}")
##############################################################################

warnings.simplefilter(action='ignore', category=FutureWarning)

class HealthCheckFilter(logging.Filter):
  def filter(self, record: logging.LogRecord) -> bool:
    return record.getMessage().find("GET /health HTTP/1.1\" 200") == -1

# Filter out /endpoint
logging.getLogger("uvicorn.access").addFilter(HealthCheckFilter())

class Price(BaseModel):
  regularMarketPrice: Union[int, float, None]
  regularMarketPreviousClose: Union[int, float, None]

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

# todo: InfoOrError = Union[Info, dict]
class Infos(BaseModel):
  infos: List[Info]
  exceptions: list

PriceOrError = Union[Price, dict]

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
  """
  Todo - 쓰레드풀 이용해서 비동기적으로 처리하기, 응답폼 단순 리스트에 티커 순서대로 성공 실패 그냥 다 담아서 반환하기
  """
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
  "/yf/price",
  tags=["Asset"],
  description="Yahoo Finance API Prices",
  response_model=List[PriceOrError]
)
async def get_price_by_tickers(tickers: List[str]) -> List[PriceOrError]:
    async def fetch_price(ticker):
        try:
            return await get_price_by_ticker(ticker)
        except HTTPException as e:
            return e.detail

    tasks = [fetch_price(ticker) for ticker in tickers]
    results = await asyncio.gather(*tasks)

    return results

@app.post(
  "/yf/price/{ticker}",
  tags=["Asset"],
  description="Yahoo Finance API Price",
  response_model=Price
)
async def get_price_by_ticker(ticker: str) -> Price:
  # print(ticker, os.getpid())
  ticker = uppercase_ticker_validation_pipe(ticker)

  loop = asyncio.get_event_loop()
  return await loop.run_in_executor(executor, get_price_by_ticker_sync, ticker)

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

def get_price_by_ticker_sync(ticker: str) -> Price:
  return get_price_if_exist(get_yf_ticker(ticker))

def get_info_by_yf_ticker(yf_ticker: yf.Ticker) -> Info:
  # end_time_test("Ticker-" + yf_ticker.ticker)
  result = {}
  result["price"] = get_price_if_exist(yf_ticker)

  # Todo: refac
  fast_info = yf_ticker.fast_info
  fast_info.currency # 이게 없으면 metadata.tradingPeriods 생기고 이를 Pydantic 에서 Serialization 못하면서 PydanticSerializationError 발생해서 최종적으로 Exception in ASGI application 으로 500 응답해버리는것 같음. 추후 이를 해결하기.

  # info 에 접근할 수 없는 경우가 종종 생기는데 이는 최대한 빠르게 고쳐야함. 그동안은 임시로 fast_info 사용함.
  try:
    # start_time_test("info-" + yf_ticker.ticker)
    result["info"] = yf_ticker.info # io
    # end_time_test("info-" + yf_ticker.ticker)
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

  5 영업일 기록이 없을때 존재하지 않는 ticker 로 판단

  #### A 안
  최근 1 영업일 기록과 5영입일 기록을 조회하고, 1 영업일 기록이 없다면 존재하지 않는 ticker 로 판단.
  1 영업일 기록에서 regularMarketPrice,
  5 영업일 기록에서 regularMarketPreviousClose 를 얻음.

  하지만, io 를 하나라도 줄이는게 더 우선된다고 판단,

  #### B 안
  5 영업일 기록만 조회,
  5 영업일간 기록이 없을때 존재하지 않는 ticker 로 판단.

  대신, A 안 대신 B 안을 선택함으로써 다음의 케이스를 절충하고있음.
  - 5 영업일 이내 상장 폐지한 에셋은 여전히 조회됨.
  - 5 영업일 이내 상장한 에셋과 상장 폐지한 에셋 사이의 구분을 못함.

  영업일을 통해 구분하는 로직으로 부정확성을 제거하면 좋지만, 추가적인 io 없이 정확한 최근 영업일을 알아내기 어려움.

  #### 리팩터링
  - 옵션 1 - Market 서버에서 거래소별 정확한 영업일을 알고 있으니, 이 데이터를 이용하면 모든 부정확성을 제거할 수 있음.
  """
  # start_time_test("history5d-" + yf_ticker.ticker)
  price_chart_5d = yf_ticker.history(period="5d") # io
  # end_time_test("history5d-" + yf_ticker.ticker)

  if is_empty(price_chart_5d):
    raise HTTPException(404, {
      "error": "NotFoundError",
      "message": "Ticker not found",
      "ticker": yf_ticker.ticker,
    })

  regularMarketPrice = nan_to_none(price_chart_5d['Close'][-1])
  regularMarketPreviousClose = nan_to_none(price_chart_5d['Close'][-2]) if len(price_chart_5d) >= 2 else None

  return {
    "regularMarketPrice": regularMarketPrice,
    "regularMarketPreviousClose": regularMarketPreviousClose,
  }

def get_yf_ticker(ticker: str) -> yf.Ticker:
  # start_time_test("Ticker-" + ticker)
  return yf.Ticker(ticker)

def is_empty(price_chart: DataFrame) -> bool:
  return price_chart.empty

def is_nan(num: any) -> bool:
  return type(num) == float and num != num

def nan_to_none(num: any) -> any:
  return None if is_nan(num) else num