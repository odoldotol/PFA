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

EXPOSE 6001

HEALTHCHECK --start-period=1m --interval=10s --timeout=5s CMD curl -f http://localhost:6001/health || exit 1

ENV CHILD_API_BASE_URL=http://market-child:8001 \
    PRODUCT_API_BASE_URL=http://product:7001

CMD ["pm2-runtime", "start", "ecosystem.config.js", "--only", "pfa_market_prod"]