FROM nginx:1.21.0-alpine

ARG CONFIG="nginx.conf"
RUN apk -U upgrade && rm /etc/nginx/conf.d/default.conf
COPY ${CONFIG} /etc/nginx/conf.d
COPY ${CONFIG} /etc/nginx/nginx.conf
