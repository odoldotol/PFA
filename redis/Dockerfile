# Todo: 클러스터

FROM redis:7.2-rc2-alpine3.18

EXPOSE 6379

HEALTHCHECK --start-period=30s --interval=10s --timeout=5s CMD redis-cli ping || exit 1