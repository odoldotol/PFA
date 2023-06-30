# PFA

## Stack
NodeJS (16) / Typescript / NestJS <br>
child_process / axios / cron / rxjs / fxts <br>
MongoDB Atlas / mongoose <br>
cache-manager / Redis / node-redis

Python (3.8) / Fastapi / uvicorn <br>
yfinance / exchange_calendars

AWS EC2 / Nginx <br>
Docker / pm2 / jest

---
<br>

## Test
```shell
$ bash script/test
```
---

<br>

## Run
>[CAUTION] docker compose and bash should be available.
```shell
$ bash script/pfa:start
```

<br>

&nbsp;The scope of serviceable assets and exchanges in this app is expandable and sustainable throughout multiple lifecycles of the app.

>&nbsp;At the start, the app does not follow any exchanges, which means there is no update schedule for any exchange. Also, the app does not possess any information about any assets.

The initial service scope of this app is 0.

<br>

---
### Localy API Docs
- #### Product http://localhost:7001/docs
- #### Market http://localhost:6001/docs
- #### [Additional] Market-Child http://localhost:8001/docs
---
<br>

>&nbsp;When something is queried, the app fetches data about that asset from the market and creates it. It also identifies the exchange to which the asset belongs and starts following it. This implies having an update schedule for that exchange and updating data according to the exchange's session on a daily basis.

The service scope expands through queries.

>&nbsp;From now on, even if the app loses the update schedule for all exchanges due to being shut down, it can independently generate schedules for the exchanges it is following.

>&nbsp;Upon relaunching the app, during the initialization phase before listening, it explores the sessions of exchanges and creates schedules. It also update assets belonging to each exchange if necessary.

<br>

---
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
<br>

---
## Reload
```shell
# Product Server (pm2 in container)
$ bash script/pfa:reload:product-pm2
```
```shell
# Market Server (pm2 in container)
$ bash script/pfa:reload:market-pm2
```
---
<br>

>&nbsp;So far, I have explained how the scope of serviceable assets and exchanges in the app can expand and be sustainable.

<br>

This design approach has two main goals:
1. Optimizing server resources.
2. Maximizing performance.

>&nbsp;Market data is extensive. Therefore, the server dynamically determines the range of resources to manage based on user requests. Consequently, if a user requests resources beyond this range, they will experience relatively slower responses. However, subsequent requests for those resources will be served from the in-memory database of the server, ensuring high performance. The in-memory database is continually managed based on exchange sessions and user requests.

<br>

---

<br>

### Clear all about this project
>down and remove all container and images about pfa
```shell
$ bash script/pfa:clear
```
>if you just want to dowm all pfa container
```shell
$ bash script/pfa:down:all
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
Docker / pm2 / jest

---
<br>

### [Development documents](https://lygorithm.notion.site/PFA-LAPIKI-29bb679db78345a7b9027b60f68da6fa)