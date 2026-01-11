# Production Dockerfile for Product Service
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package.json yarn.lock ./
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
COPY services/product-service/package.json ./services/product-service/

RUN yarn install --frozen-lockfile

COPY packages/types ./packages/types
COPY packages/utils ./packages/utils
COPY services/product-service ./services/product-service
COPY tsconfig.json ./

RUN cd packages/types && yarn build && \
    cd ../utils && yarn build:backend && \
    cd ../../services/product-service && yarn build

# Production image - standalone, no workspace
FROM node:20-alpine

WORKDIR /app

# Copy built service
COPY --from=builder /app/services/product-service/dist ./dist
COPY --from=builder /app/services/product-service/package.json ./

# Copy built packages (needed at runtime)
COPY --from=builder /app/packages/types/dist ./node_modules/@3asoftwares/types/dist
COPY --from=builder /app/packages/types/package.json ./node_modules/@3asoftwares/types/
COPY --from=builder /app/packages/utils/dist ./node_modules/@3asoftwares/utils/dist
COPY --from=builder /app/packages/utils/package.json ./node_modules/@3asoftwares/utils/

# Install production dependencies using npm (avoids yarn workspace resolution)
RUN sed -i 's/"@3asoftwares\/utils": "\*"/"@3asoftwares\/utils": "file:node_modules\/@3asoftwares\/utils"/g' package.json && \
    npm install --omit=dev --ignore-scripts

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/index.js"]
