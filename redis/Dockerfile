# Todo: 클러스터

FROM redis:7.2-rc2-alpine3.18

EXPOSE 6379

HEALTHCHECK --interval=10m --timeout=5s CMD redis-cli ping || exit 1