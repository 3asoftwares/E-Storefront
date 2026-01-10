#!/bin/bash

# Script to setup and run the project with Docker
# Works on macOS, Windows (WSL2), and Linux

set -e

echo "============================================"
echo "E-Commerce Platform - Docker Setup"
echo "============================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop:"
    echo "   macOS: https://www.docker.com/products/docker-desktop"
    echo "   Windows: https://www.docker.com/products/docker-desktop"
    echo "   Linux: https://docs.docker.com/engine/install/"
    exit 1
fi

echo "✓ Docker is installed"

# Check if Docker daemon is running
if ! docker ps &> /dev/null; then
    echo "❌ Docker daemon is not running. Please start Docker Desktop."
    exit 1
fi

echo "✓ Docker daemon is running"
echo ""

# Options
echo "Select setup option:"
echo "1) Run everything (Frontend + Backend + MongoDB + Redis)"
echo "2) Run backend & infrastructure only"
echo "3) Run frontend only (requires backend running)"
echo "4) Rebuild and run everything"
echo "5) View logs"
echo "6) Stop all services"
echo ""

read -p "Enter choice (1-6): " choice

case $choice in
    1)
        echo ""
        echo "Starting all services..."
        docker-compose up
        ;;
    2)
        echo ""
        echo "Starting backend & infrastructure..."
        docker-compose -f docker-compose.dev.yml up mongodb redis backend
        ;;
    3)
        echo ""
        echo "Starting frontend..."
        docker-compose -f docker-compose.dev.yml up frontend
        ;;
    4)
        echo ""
        echo "Rebuilding images..."
        docker-compose build --no-cache
        echo ""
        echo "Starting all services..."
        docker-compose up
        ;;
    5)
        echo ""
        docker-compose logs -f
        ;;
    6)
        echo ""
        echo "Stopping all services..."
        docker-compose down
        ;;
    *)
        echo "Invalid option"
        exit 1
        ;;
esac
