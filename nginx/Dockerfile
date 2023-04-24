FROM nginx:1.24.0-alpine3.17

COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./conf.d /etc/nginx/conf.d

EXPOSE 80

HEALTHCHECK --interval=10m --timeout=5s CMD curl -f http://localhost:80/health || exit 1