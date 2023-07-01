# Market

도커가 설치되어 있어야 합니다.
- 이미지 빌드
```shell
$ docker build . -t pfa-market
```
- 컨테이너 실행
```shell
$ docker run -p 6001:6001 --name market pfa-market
```
---
### API Doc http://localhost:6001/docs

---

<br>

## Test
```shell
$ sh scripts/test
```