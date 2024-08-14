<div align="right">
  <img src="https://storage.googleapis.com/odoldotol-image-store/Likelion2.jpg" alt="" height="160">
</div>


# Level 1

### Product
- [KakaoTalk Chatbot Channel Link](http://pf.kakao.com/_jxbgxmxj)

<br>

### APIs
- Product https://product.lapiki-invest.com/docs
- Market https://market.lapiki-invest.com/docs (documents only)
- Market-Child https://child.lapiki-invest.com/docs (documents only)

---
---

<br>
<br>

## Stack
NodeJS (18.12.1) / Typescript / NestJS <br>
PostgreSQL / typeorm <br>
MongoDB Atlas / mongoose <br>
~~cache-manager~~ / Redis / node-redis <br>
fxts / rxjs <br>
jest <br>
~~child_process~~ / ~~cron~~ <br>

AWS EC2 / Nginx <br>
Docker / pm2 (will be deprecated) <br>

Python (3.8) / Fastapi / uvicorn <br>
yfinance / exchange_calendars <br>

---
<br>

## Test
>[CAUTION] <br>
>npm, docker compose(V2) should be available. <br>
>docker daemon should be running. <br>
>Local Port 5432, 6379, 27017 should be available. <br>
>- Todo: use test containers and port
```shell
# First, Install all the dependencies
$ sh scripts/npm:install

$ sh scripts/test
```
---

<br>

## Run
>[CAUTION] <br>
>cURL should be available.
```shell
$ sh scripts/pfa:start
```

<br>

&nbsp;The scope of serviceable assets and exchanges in this app is expandable and sustainable throughout multiple lifecycles of the app.

>&nbsp;At the start, the app does not follow any exchanges, which means there is no update schedule for any exchange. Also, the app does not possess any information about any assets.

The initial service scope of this app is 0.

<br>

---
### APIs
Here are three servers running. <br>
The Market server focuses on updating and managing market data. <br>
The Product server directly serves data. <br>
The Market-Child is just a server dependent on the market server. <br>

- #### Product http://localhost:7001/docs
- #### Market http://localhost:6001/docs
- #### Market-Child http://localhost:8001/docs
---
<br>

>&nbsp;When something is queried, the app fetches data about that asset from the market and creates it. It also identifies the exchange to which the asset belongs and starts following it. This implies having an update schedule for that exchange and updating data according to the exchange's session on a daily basis.

The service scope expands through queries.

>&nbsp;From now on, even if the app loses the update schedule for all exchanges due to being shut down, it can independently generate schedules for the exchanges it is following.

>&nbsp;Upon relaunching the app, during the initialization phase before listening, it explores the sessions of exchanges and creates schedules. It also update assets belonging to each exchange if necessary.

<br>

---

<br>

## Logs, Monit
Use below,
```
$ docker [OPT] logs [CONTAINER]
```

OR

```shell
$ sh scripts/pfa:[EXCUTION]:[SERVER] [LINES]
```
- EXCUTION: 아래 중 택 1 필수
  - logs
  - monit

<br>

- SERVER: 아래 중 택 1 필수
  - product
  - market
  - market-child
    - EXCUTION = monit 인 경우 선택 불가능

<br>

- LINES: number
  - EXCUTION = logs 인 경우에 선택적으로 전달 (기본값: 50)

<br>

---

<br>

## Reload (0 downtime)
[limitations] Using pm2 in each containers

```shell
# Product Server (pm2 in container)
$ sh scripts/pfa:reload:product-pm2
```
```shell
# Market Server (pm2 in container)
$ sh scripts/pfa:reload:market-pm2
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

### Details

The following is a sequence diagram showing the initialization to the listen phase of the market server.

![market-init-dia](https://storage.googleapis.com/odoldotol-image-store/market-init-dia.png) 
<span style="float:right;">[should be updated]</span>

<br>

...more


<br>

---

<br>

### Clear all about this project
>[CAUTION] <br>
>down and remove all containers and images about pfa.
```shell
$ sh scripts/pfa:clear
```
>if you just want to stop or down all pfa containers,
```shell
# stop
$ sh scripts/pfa:stop:all

# down
$ sh scripts/pfa:down:all
```

---

<br>
<br>

# Deploy
![deploy-dia](https://storage.googleapis.com/odoldotol-image-store/deploy-dia.png)

### RDS Certificate
```
cert/aws-rds.pem
```

### Compose .env files
```
env/.env.market.guide.production
env/.env.product.guide.production
```
#### Then,
```shell
$ sh scripts/pfa:start:prod
```
<br>

## Migrations
```sh
# typeorm Migrations dir
market/migrations/
product/migrations/
```

### PostgreSQL
각 컨테이너 내부에서 typeorm 이용. (migration 관리 가능한 admin 있으면 편할것같음)

>Migration 과 앱리로드가 필요한 경우, Migration -> 앱 리로드 순서로 진행해야 안정적임.  
현 상태에서는 이것을 매끄럽게 하려면 귀찮은 일들이 있음. 이를 매끄럽게 가능하도록 시스템화 할 필요가 있음.  
자세한 내용은 별도 Migration 문서에서 다룸.

<br>

## Monitoring

### AWS CloudWatch

#### CloudWatch Agent
```sh
# config.json 파일을 초기화하고 도커 컨테이너 로그파일의 위치를 추적하여 cwagent 를 재시작함.
$ sh scripts/cwagent:restart
```

<br>

---
---

<br>
<br>


## Market

### Modules

![market-module-dia](https://storage.googleapis.com/odoldotol-image-store/market-module-dia.png)
<span style="float:right;">[should be updated]</span>


### Instances

![market-instance-dia](https://storage.googleapis.com/odoldotol-image-store/market-instance-dia.png)
<span style="float:right;">[should be updated]</span>