# Production Dockerfile for Microservices
# Build from root: docker build -f services/auth-service/Dockerfile -t auth-service .

FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy root package files
COPY package.json yarn.lock ./

# Copy workspace package.json files (only what exists)
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
COPY services/auth-service/package.json ./services/auth-service/

# Install all dependencies
RUN yarn install --frozen-lockfile

# Copy source files
COPY packages/types ./packages/types
COPY packages/utils ./packages/utils
COPY services/auth-service ./services/auth-service
COPY tsconfig.json ./

# Build packages and service (using cd instead of yarn workspace)
RUN cd packages/types && yarn build && \
    cd ../utils && yarn build:backend && \
    cd ../../services/auth-service && yarn build

# Production image - standalone, no workspace
FROM node:20-alpine

WORKDIR /app

# Copy built service
COPY --from=builder /app/services/auth-service/dist ./dist
COPY --from=builder /app/services/auth-service/package.json ./

# Copy built packages (needed at runtime)
COPY --from=builder /app/packages/types/dist ./node_modules/@3asoftwares/types/dist
COPY --from=builder /app/packages/types/package.json ./node_modules/@3asoftwares/types/
COPY --from=builder /app/packages/utils/dist ./node_modules/@3asoftwares/utils/dist
COPY --from=builder /app/packages/utils/package.json ./node_modules/@3asoftwares/utils/

# Install production dependencies using npm (avoids yarn workspace resolution)
RUN sed -i 's/"@3asoftwares\/utils": "\*"/"@3asoftwares\/utils": "file:node_modules\/@3asoftwares\/utils"/g' package.json && \
    npm install --omit=dev --ignore-scripts

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/index.js"]
