FROM pfa-base-node

WORKDIR /home/node/app
COPY ./market/package*.json .
RUN npm ci

COPY ./market .
RUN npm run build:prod

COPY ./env/.env.market .
COPY ./cert/aws-rds.pem .

EXPOSE 6001

HEALTHCHECK --start-period=2m --interval=5m --timeout=2m CMD sh health-check

ENV CHILD_API_BASE_URL=http://market-child:8001 \
    PRODUCT_API_BASE_URL=http://product:7001

CMD ["pm2-runtime", "start", "ecosystem.config.js", "--only", "pfa_market_prod"]