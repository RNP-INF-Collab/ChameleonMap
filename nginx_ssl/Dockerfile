FROM nginx:1.27.0-alpine

ARG CONFIG="nginx.conf"
RUN apk -U upgrade && rm /etc/nginx/conf.d/default.conf
COPY crt.crt /etc/nginx/crt.crt
COPY key.key /etc/nginx/key.key
COPY ${CONFIG} /etc/nginx/conf.d
