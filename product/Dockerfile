FROM keymetrics/pm2:16-alpine
ENV MARKET_API_BASE_URL=http://market:6001
WORKDIR /home/node/app
COPY package.json .
RUN npm config set fetch-retry-maxtimeout 1200000 \
&& npm install -g npm@latest
RUN npm install
COPY . .
RUN npm run build:prod
EXPOSE 7001
CMD ["pm2-runtime", "start", "ecosystem.config.js", "--only", "pfa_product_prod"]