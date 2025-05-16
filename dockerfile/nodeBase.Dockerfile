FROM node:18.20.8-alpine3.21

RUN apk update \
&& apk add --no-cache curl

RUN npm install -g npm@8.19.3 pm2 \
&& npm config set fetch-retry-maxtimeout 1200000 \
&& npm config set fetch-timeout 1200000

ENV NODE_OPTIONS="--max-old-space-size=1024"