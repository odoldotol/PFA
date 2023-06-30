# Todo: 클러스터

FROM redis:7.2-rc2-alpine3.18

COPY ./health-check .

EXPOSE 6379

HEALTHCHECK --start-period=5s --interval=5m --timeout=5s CMD sh health-check