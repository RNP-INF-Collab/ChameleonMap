FROM nginx:1.27.0-alpine

ARG CONFIG="nginx.conf"
RUN apk -U upgrade && rm /etc/nginx/conf.d/default.conf
COPY <certificate.crt> /etc/nginx/<certificate.crt>
COPY <certificate_key.key> /etc/nginx/<certificate_key.crt>.key
COPY ${CONFIG} /etc/nginx/conf.d
