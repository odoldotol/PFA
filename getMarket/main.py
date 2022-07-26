from fastapi import FastAPI

import yfinance as yf


app = FastAPI()


@app.get("/")
async def read_root():
    return {"Hello": "Welcome to the PFA's Get Market API"}


@app.get("/yf/info")
async def getInfo(ticker: str):
    """
    ticker 로 yf 에서 info 가져와 응답.
    """

    ticker = ticker.upper()
    info = yf.Ticker(ticker).info

    try:
        if info['symbol'] == ticker:
            result = {"info": info}
        else:
            result = {"error": "Symbol is not equal to a ticker"}
    except:
        result = {"error": "Ticker is not found"}
    
    return result


@app.get("/yf/price")
async def getPrice(ticker: str):
    """
    ticker 로 yf 에서 최근 가격 가져와서 응답.
    """

    ticker = ticker.upper()
    price = yf.Ticker(ticker).history(period="1d")['Close'][0]

    return {"price": price}