FROM nginx:1.24.0-alpine3.17

COPY ./nginx/local/nginx.conf /etc/nginx/nginx.conf
COPY ./nginx/local/conf.d /etc/nginx/conf.d
COPY ./nginx/health-check .

EXPOSE 80

HEALTHCHECK --start-period=10s --interval=5m --timeout=10s CMD sh health-check