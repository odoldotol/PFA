FROM keymetrics/pm2:16-alpine

RUN apk update \
&& apk add --no-cache curl

RUN npm install -g npm@latest \
&& npm config set fetch-retry-maxtimeout 1200000 \
&& npm config set fetch-timeout 1200000

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