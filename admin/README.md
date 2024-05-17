# Pushing Yahoo Finance Asset Info

>Node.js (V18)

<br><br>

## Asset Chart

#### .env 파일 구성하여 사용할 차트 파일 정하기.
>.env.guide 참고

<br>

아래는 csv 차트파일 예.
```sh
data/chart/russell-1000-index-05-13-2024.csv
data/chart/russell-2000-index-05-14-2024-page-1.csv # 시총 상위 1000개
data/chart/russell-2000-index-05-14-2024-page-2.csv # 시총 하위 1000개
data/chart/kospi-all-05-13-2024.csv # 953개
data/chart/kosdaq-all-05-13-2024.csv # 1728개
```

### Chart Reference

Russell 1000 ETF Components [Ref](https://www.barchart.com/stocks/indices/russell/russell1000?viewName=fundamental&orderBy=marketCap&orderDir=desc#:~:text=screen%20%20flipcharts-,download,-Last%20Updated%3A%2005) <br>
Russell 2000 ETF Components [Ref](https://www.barchart.com/stocks/indices/russell/russell2000?viewName=fundamental&orderBy=marketCap&orderDir=desc#:~:text=screen%20%20flipcharts-,download,-Last%20Updated%3A%2005) <br>
Kospi [Ref](https://seibro.or.kr/websquare/control.jsp?w2xPath=/IPORTAL/user/stock/BIP_CNTS02004V.xml&menuNo=41) <br>
Kosdaq [Ref](https://seibro.or.kr/websquare/control.jsp?w2xPath=/IPORTAL/user/stock/BIP_CNTS02004V.xml&menuNo=41) <br>

<br>

---

<br><br>

## Excute

>로컬에 필요한 각 서버들 열어야함

<br><br>

### Command
```sh
# PathEnd 와 ApiFlag 는 ExcuteFileName 가 childApiTest 일때만 필요
$ time node pushingYfInfo/[ExcuteFileName] [ChartName] [Limit] [PathEnd] [ApiFlag]
```
- ExcuteFileName <br> 다음 중 택 1
  - push
  - childApiTest

<br>

- ChartName: 사용할 Asset 차트 이름 <br> 다음 중 택 1
  - russell1000
  - russell2000_1
  - russell2000_2
  - kospi
  - kosdaq

<br>

- Limit: number <br> 요청할 Asset 수 제한 (차트에서 순서대로 Limit 만큼 Asset 뽑아내서 요청함)

<br>

- PathEnd (childApiTest) <br> 다음 중 택 1
  - info
  - price

<br>

- ApiFlag (childApiTest) <br> 1 | Undefined <br> (정확히는, 각각 true | false 로 평가될 아무 값)
  - 1 => childApi, /yf/info (단일 요청)
  - Undefined (입력 안하기) => /yf/info/{ticker} (각 ticker 병렬 요청)

<br><br>

### Result
아래 경로에 json 파일로 저장
```
responseBody/[ExcuteFileName]/[ChartFileName].limit-[Limit].timestemp-[Timestemp].json
```
- ExcuteFileName: 실행한 파일이름
- ChartFileName: 사용한 차트 파일명
- Limit: 실행시 커맨드라인 인자 Limit
- Timestemp: 완료된 시간

<br><br>

---
---