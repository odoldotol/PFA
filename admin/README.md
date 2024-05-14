# Pushing Yahoo Finance Asset Info

>Node.js (V18)

<br>

## Asset Chart 준비
- Russell 1000 ETF Components [Ref](https://www.barchart.com/stocks/indices/russell/russell1000?viewName=fundamental&orderBy=marketCap&orderDir=desc#:~:text=screen%20%20flipcharts-,download,-Last%20Updated%3A%2005)
```
data/chart/russell-1000-index-05-13-2024.csv
```
<br>

--- 
<br><br><br> 로컬에 각 서버들 열어두고 테스트 <br><br>

## ChildApiTest

캐시 이용 못하도록 적절하게 리스타트 하면서 테스트
```
$ time node pushingYfInfo/childApiTest [ChartName] [Limit] [ApiFlag]
```
- ChartName: Asset 뽑아낼때 사용할 차트 이름 <br> 다음 중 택 1
  - russell1000
  - russell2000_1

<br>

- Limit: number <br> 요청할 Asset 수 제한 (차트에서 순서대로 Limit 만큼 Asset 뽑아내서 요청함)

<br>

- ApiFlag <br> 1 | Undefined <br> (정확히는, 각각 true | false 로 평가될 아무 값)
  - 1 => childApi, /yf/info (단일 요청)
  - Undefined (입력 안하기) => /yf/info/{ticker} (각 ticker 병렬 요청)

<br><br>

### 응답
아래 경로에 json 파일로 저장됨
```
responseBody/childApiTest/[ChartFileName].limit-[Limit].timestemp-[Timestemp].json
```
- ChartFileName: 사용한 차트 파일명
- Limit: 실행시 커맨드라인 인자 Limit
- Timestemp: 완료된 시간

<br><br>

---

<br><br>

## Push
```
$ time node pushingYfInfo/push [ChartName] [Limit]
```
- ChartName: Asset 뽑아낼때 사용할 차트 이름 <br> 다음 중 택 1
  - russell1000
  - russell2000_1

<br>

- Limit: number <br> 요청할 Asset 수 제한 (차트에서 순서대로 Limit 만큼 Asset 뽑아내서 요청함)

<br><br>

### 응답
아래 경로에 json 파일로 저장됨
```
responseBody/push/[ChartFileName].limit-[Limit].timestemp-[Timestemp].json
```
- ChartFileName: 사용한 차트 파일명
- Limit: 실행시 커맨드라인 인자 Limit
- Timestemp: 완료된 시간