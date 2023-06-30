FROM nginx:1.24.0-alpine3.17

COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./conf.d /etc/nginx/conf.d
COPY ./health-check .

EXPOSE 80

HEALTHCHECK --start-period=10s --interval=5m --timeout=10s CMD sh health-check