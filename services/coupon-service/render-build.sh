# Render Build Script for Coupon Service
# This script builds the workspace packages before building the service

echo "=== Building workspace packages ==="
cd ../..
yarn install
yarn build:types
yarn build:utils

echo "=== Building coupon-service ==="
cd services/coupon-service
yarn build
