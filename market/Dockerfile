FROM keymetrics/pm2:16-alpine
ENV CHILD_API_BASE_URL=http://market-child:8001 \
    PRODUCT_API_BASE_URL=http://product:7001
WORKDIR /home/node/app
COPY package.json .
RUN npm config set fetch-retry-maxtimeout 1200000 \
&& npm install -g npm@latest
RUN npm install
COPY . .
RUN npm run build:prod
EXPOSE 6001
CMD ["pm2-runtime", "start", "ecosystem.config.js", "--only", "pfa_market_prod"]