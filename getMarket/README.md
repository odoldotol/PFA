# Market Child

도커가 설치되어 있어야 합니다.
- 이미지 빌드
```shell
$ docker build . -t pfa-market-child
```
- 컨테이너 실행
```shell
$ docker run -p 8000:8000 --name market-child pfa-market-child
```
---
### API Doc http://localhost:8000/docs