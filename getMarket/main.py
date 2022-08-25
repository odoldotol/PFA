from fastapi import FastAPI

import yfinance as yf


app = FastAPI()


@app.get("/")
async def read_root():
    return {"Hello": "Welcome to the PFA's Get Market API"}


# @app.get("/yf/info")
# async def getInfo(ticker: str):
#     """
#     ticker 로 yf 에서 info 가져와 응답.
#     """

#     ticker = ticker.upper()
#     info = yf.Ticker(ticker).info

#     try:
#         if info['symbol'] == ticker:
#             result = {ticker: info}
#         else:
#             result = {ticker: {"error": "Symbol is not equal to a ticker"}}
#     except:
#         result = {ticker: {"error": "Ticker is not found"}}
    
#     return result


# @app.get("/yf/price")
# async def getPrice(ticker: str):
#     """
#     ticker 로 yf 에서 최근 가격 가져와서 응답.
#     """

#     ticker = ticker.upper()
#     price = yf.Ticker(ticker).history(period="1d")['Close'][0]

#     return {ticker: price}


@app.post("/yf/info")
async def get_info_by_list(ticker_list: list[str]):
    """
    ticker_list 안에 각 ticker 로 yf 에서 info 가져와 응답.
    """

    result = []
    for ticker in ticker_list:
        # ticker = ticker.upper()

        try:
            info = yf.Ticker(ticker).info

            if info['symbol'] == ticker:
                result.append(info)
            else:
                result.append({
                    "error": "Symbol is not equal to a ticker",
                    "ticker": ticker,
                    "symbol": info['symbol']
                    })
        except:
            result.append({
                "error": "Ticker is not found",
                "ticker": ticker
                })

    return result


@app.post("/yf/price")
async def get_price_by_list(ticker_list: list[str]):
    """
    ticker_list 안에 각 ticker 로 yf 에서 최근 가격 가져와 응답.
    """

    result = []
    for ticker in ticker_list:

        try:
            price = yf.Ticker(ticker).history(period="1d")['Close'][0]

            result.append(price)
        except:
            result.append({
                "error": "Could not get price from yfinance",
                "ticker": ticker
                })

    return result