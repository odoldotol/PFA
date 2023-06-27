# Todo: 클러스터

FROM redis:7.2-rc2-alpine3.18

EXPOSE 6379

HEALTHCHECK --start-period=20s --interval=5s --timeout=2s CMD redis-cli ping || exit 1