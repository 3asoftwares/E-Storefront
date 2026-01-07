FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json yarn.lock ./
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
COPY services/coupon-service/package.json ./services/coupon-service/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY packages/types ./packages/types
COPY packages/utils ./packages/utils
COPY services/coupon-service ./services/coupon-service

# Build packages and service
RUN yarn workspace @e-commerce/types build
RUN yarn workspace @e-commerce/utils build
RUN yarn workspace coupon-service build

# Production image
FROM node:18-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/services/coupon-service ./services/coupon-service

WORKDIR /app/services/coupon-service

ENV NODE_ENV=production
ENV PORT=3014

EXPOSE 3014

CMD ["node", "dist/index.js"]
