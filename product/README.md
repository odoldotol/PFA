# Product

도커가 설치되어 있어야 합니다.
- 이미지 빌드
```shell
$ docker build . -t pfa-product
```
- 컨테이너 실행
```shell
$ docker run -p 7001:7001 --name product pfa-product
```
---
### API Doc http://localhost:7001/docs

---

<br>

## Test
```shell
$ sh scripts/test
```