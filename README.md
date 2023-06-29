# PFA
## Test
```shell
$ bash script/test
```
---

<br>

## Run
[CAUTION] docker compose and bash should be available.
```shell
$ bash script/pfa:start
```

first, it has no update schedule of exchanges.<br>
asset either.<br>
but you request price of any asset to server api,<br>
you will get it and server start to manage the exchange of asset you request.<br>
The exchange data is created in database.<br>
So, relaunch this app, you can confirm that server try to make exchange up-to-date.

---

<br>

### Localy API Docs
- #### Product http://localhost:7001/docs
- #### Market http://localhost:6001/docs
- #### [Additional] Market-Child http://localhost:8001/docs
---
<br>

## Logs Monitering
<br>

### Product Server
```shell
# Logs
$ bash script/pfa:logs:product

# Monitering
$ bash script/pfa:monit:product
```
<br>

### Market Server
```shell
# Logs
$ bash script/pfa:logs:market

# Monitering
$ bash script/pfa:monit:market
```
<br>

### Market Child Server
```shell
# Logs
$ bash script/pfa:logs:market-child
```
---

<br>

## Pm2-Reload
```shell
# Product Server
$ bash script/pfa:reload:product-pm2
```
```shell
# Market Server
$ bash script/pfa:reload:market-pm2
```
---
<br>

## Deploy
### Compose .env files
```
market/.env.guide
product/.env.guide
```
Then,
```shell
$ bash script/pfa:start:prod
```
---

<br>

### Clear all about this project
```shell
$ bash script/pfa:clear
```
<br>

---
---

<br>

## [KakaoTalk Chatbot Channel](http://pf.kakao.com/_jxbgxmxj)

<br>

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