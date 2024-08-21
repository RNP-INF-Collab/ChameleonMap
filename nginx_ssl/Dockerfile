FROM nginx:1.27.0-alpine

ARG CONFIG="nginx.conf"
RUN apk -U upgrade && rm /etc/nginx/conf.d/default.conf
COPY cert.crt /etc/nginx/cert.crt
COPY key.key /etc/nginx/key.key
COPY ${CONFIG} /etc/nginx/conf.d
