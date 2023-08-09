FROM node:20-alpine AS base
RUN apk update
WORKDIR /app
ENV YARN_CACHE_FOLDER=.yarn-cache

FROM base AS all-deps
COPY package.json ./package.json
COPY yarn.lock ./yarn.lock
RUN yarn --ignore-scripts

FROM all-deps as prod-deps
RUN yarn --production --ignore-scripts --prefer-offline

FROM all-deps AS builder
COPY . .
RUN yarn build

FROM base as runner
RUN yarn global add pino-pretty
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./package.json
CMD yarn start

