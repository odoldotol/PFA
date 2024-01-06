# Todo: Dedup market/Dockerfile, product/Dockerfile

FROM pfa-base-node

WORKDIR /home/node/app
COPY package.json .
RUN npm install

COPY . .
RUN npm run build:prod

EXPOSE 7001

HEALTHCHECK --start-period=1m --interval=5m --timeout=1m CMD sh health-check

ENV MARKET_API_BASE_URL=http://market:6001 \
    REDIS_URL=redis://product-redis:6379

CMD ["pm2-runtime", "start", "ecosystem.config.js", "--only", "pfa_product_prod"]