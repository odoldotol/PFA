FROM nginx:1.24.0-alpine3.17

COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./conf.d /etc/nginx/conf.d

EXPOSE 80

HEALTHCHECK --start-period=30s --interval=10s --timeout=5s CMD curl -f http://localhost:80/health || exit 1