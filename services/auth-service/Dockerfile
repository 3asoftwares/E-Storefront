FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json yarn.lock ./
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
COPY services/auth-service/package.json ./services/auth-service/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY packages/types ./packages/types
COPY packages/utils ./packages/utils
COPY services/auth-service ./services/auth-service

# Build packages and service
RUN yarn workspace @e-commerce/types build
RUN yarn workspace @e-commerce/utils build
RUN yarn workspace auth-service build

# Production image
FROM node:18-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/services/auth-service ./services/auth-service

WORKDIR /app/services/auth-service

ENV NODE_ENV=production
ENV PORT=3010

EXPOSE 3010

CMD ["node", "dist/index.js"]
