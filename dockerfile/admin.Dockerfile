FROM node:16.20.2-alpine3.18

RUN apk update \
&& apk add --no-cache curl

WORKDIR /home/node/app

COPY ./admin .

ENV MARKET_API_HOSTNAME=market \
  CHILD_API_HOSTNAME=market-child

CMD tail -f /dev/null