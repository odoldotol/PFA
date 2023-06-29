FROM nginx:1.24.0-alpine3.17

COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./conf.d /etc/nginx/conf.d

EXPOSE 80

HEALTHCHECK --start-period=20s --interval=5s --timeout=3s CMD curl -f --max-time 4 http://localhost:80/health || exit 1