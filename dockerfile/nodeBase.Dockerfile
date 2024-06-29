# keymetrics/pm2:18-alpine node version: 18.12.1
FROM keymetrics/pm2:18-alpine

RUN apk update \
&& apk add --no-cache curl

RUN npm install -g npm@8.19.3 \
&& npm config set fetch-retry-maxtimeout 1200000 \
&& npm config set fetch-timeout 1200000

ENV NODE_OPTIONS="--max-old-space-size=600"