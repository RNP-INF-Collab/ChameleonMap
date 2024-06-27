###########
# BUILDER #
###########
FROM node:20-alpine as builder
WORKDIR /app
COPY ./package*.json /app/
RUN npm install
COPY . /app
ARG configuration=production
RUN npm run build -- --outputPath=./dist/out --configuration $configuration

##############
# DEPLOYMENT #
##############
FROM httpd:2.4.51-alpine as deployment
COPY --from=builder /app/dist/out/ /usr/local/apache2/htdocs


###############
# DEVELOPMENT #
###############
FROM node:20-alpine as development

WORKDIR /usr/src/app

CMD npm install -g @angular/cli && npm install \
 && npm start
