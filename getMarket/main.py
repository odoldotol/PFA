from fastapi import FastAPI

import yfinance as yf


app = FastAPI()


@app.get("/")
async def read_root():
    return {"Hello": "Welcome to the PFA's Get Market API"}


@app.post("/yf")
async def getData(ticker: str):
    """
    ticker 로 yf 에서 info 가져와 성공하면 MongoDB 에 저장하고 info 는 그대로 응답한다.
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