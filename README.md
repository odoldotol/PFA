# PFA

## Compose .env files
```
market/.env.guide
product/.env.guide
```

<br>

## Build and Run
[CAUTION] docker compose and bash should be available.
```shell
$ bash script/pfa:start
```

<br>

## Test
```shell
$ bash script/test
```

<br>

---

<br>

## [KakaoTalk Chatbot Channel](http://pf.kakao.com/_jxbgxmxj)

![initial](https://storage.googleapis.com/odoldotol-image-store/ezgif.com-gif-maker.gif)

---

<br>

## API

### [getPrice Api](https://product.lapiki-invest.com/docs#/Development/DevController_getPrice)

![initial](https://storage.googleapis.com/odoldotol-image-store/ezgif.com-video-to-gif.gif)

## Docs
- ### Product https://product.lapiki-invest.com/docs

- ### Market https://market.lapiki-invest.com/docs
- ### [Additional] Market-Child https://child.lapiki-invest.com/docs


### If it has been run in local,
- #### Product http://localhost:7001/docs
- #### Market http://localhost:6001/docs
- #### [Additional] Market-Child http://localhost:8001/docs

---
---

<br>

## Structure
![initial](https://storage.googleapis.com/odoldotol-image-store/Screen%20Shot%202023-06-22%20at%203.51.03%20AM.png)

---

<br>

## Stack
NodeJS (16) / Typescript / NestJS <br>
child_process / axios / cron / rxjs / fxts <br>
MongoDB Atlas / mongoose <br>
cache-manager / Redis / node-redis

Python (3.8) / Fastapi / uvicorn <br>
yfinance / exchange_calendars

AWS EC2 / Nginx <br>
Docker / pm2

---
<br>

### [Development documents](https://lygorithm.notion.site/PFA-LAPIKI-29bb679db78345a7b9027b60f68da6fa)