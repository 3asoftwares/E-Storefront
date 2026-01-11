# Production Dockerfile for GraphQL Gateway
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package.json yarn.lock ./
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
COPY services/graphql-gateway/package.json ./services/graphql-gateway/

RUN yarn install --frozen-lockfile

COPY packages/types ./packages/types
COPY packages/utils ./packages/utils
COPY services/graphql-gateway ./services/graphql-gateway
COPY tsconfig.json ./

RUN cd packages/types && yarn build && \
    cd ../utils && yarn build:backend && \
    cd ../../services/graphql-gateway && yarn build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/services/graphql-gateway/dist ./dist
COPY --from=builder /app/services/graphql-gateway/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/index.js"]
