# Nginx

도커가 설치되어 있어야 합니다.
- 이미지 빌드
```shell
$ docker build . -t pfa-nginx
```
- 컨테이너 실행
```shell
$ docker run -p 80:80 --name nginx pfa-nginx
```
---