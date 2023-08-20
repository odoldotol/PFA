# Market

```shell
$ docker build . -t pfa-market
```
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


## Dev
Attention: Ensure there is no PostgreSQL running on port 5432 in your local environment
```
$ start:dev
$ start:dev:mongo-atlas
```