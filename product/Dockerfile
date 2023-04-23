FROM keymetrics/pm2:16-alpine

RUN apk update \
&& apk add --no-cache curl

ENV MARKET_API_BASE_URL=http://market:6001

RUN npm install -g npm@latest \
&& npm config set fetch-retry-maxtimeout 1200000 \
&& npm config set fetch-timeout 1200000

WORKDIR /home/node/app
COPY package.json .
RUN npm install

COPY . .
RUN npm run build:prod

EXPOSE 7001

HEALTHCHECK --interval=10m --timeout=5s CMD curl -f http://localhost:7001/health || exit 1

CMD ["pm2-runtime", "start", "ecosystem.config.js", "--only", "pfa_product_prod"]