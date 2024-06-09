### simple_dev_20240513
```
simple/dev.20240513
```

RUSSELL 1997 <br>
KOSPI 950 <br>
KOSDAQ 969 <br>
총 3916 레코드 인서트 <br>

---

<br>

아래 4 개 차트를 이용
```
russell-1000-index-05-13-2024
russell-2000-index-05-14-2024-page-1
kospi-all-05-13-2024
kosdaq-all-05-13-2024 (limit 1000)
```

2024 년 06 월 04 일 기준 <br>
아래 Market api 에 위 차트들로 요청,
그 결과로 실행되는 쿼리를 모두 실행한 것과 결과 같음. <br>

>POST asset/subscribe <br>

---

<br>

아래는 위 요청으로 만들어진 실제 Seeder 로 사용될 쿼리들.

```sh
sql/insert.russell-1000-index-05-13-2024.T20240604.sql
# insert: 1000
```
```sh
insert.russell-2000-index-05-14-2024-page-1.T20240604.sql
# insert: 997 (fetch failure 3)
```
```sh
insert.kospi-all-05-13-2024.T20240604.sql
# insert: 950 (fetch failure 3)
```
```sh
insert.kosdaq-all-05-13-2024-cut-1-500.T20240604.sql
# insert: 487 (fetch failure 13)
```
```sh
insert.kosdaq-all-05-13-2024-cut-501-1000.T20240604.sql
# insert: 482 (fetch failure 18)
```

>쿼리에 대한 정보는 디렉토리 sql 에서 확인
