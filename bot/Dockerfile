FROM node:12.13.0-alpine AS build

COPY bot/package.json bot/package-lock.json /var/www/bot/
WORKDIR /var/www/bot
RUN npm ci

COPY bot/tsconfig.json \
  bot/tslint.json \
  bot/.prettierignore \
  bot/.prettierrc.json /var/www/bot/
COPY bot/src /var/www/bot/src/

WORKDIR /var/www/bot
RUN npm run lint
RUN npm run build

FROM node:12.13.0-alpine

ENV NODE_ENV production

COPY bot/package.json bot/package-lock.json /var/www/bot/
WORKDIR /var/www/bot
RUN npm ci --only production

COPY --from=build /var/www/bot/dist /var/www/bot

COPY bot/docker-entrypoint.sh /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
