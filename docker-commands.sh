#!/bin/bash

# E-Commerce Docker Quick Commands Reference
# Run this for quick Docker operations

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print headers
print_header() {
    echo -e "\n${BLUE}================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Main commands
case "$1" in
    # Container Management
    "start")
        print_header "Starting all containers"
        docker-compose -f "$COMPOSE_FILE" up -d
        print_success "All containers started"
        docker-compose -f "$COMPOSE_FILE" ps
        ;;
    
    "stop")
        print_header "Stopping all containers"
        docker-compose -f "$COMPOSE_FILE" stop
        print_success "All containers stopped"
        ;;
    
    "restart")
        print_header "Restarting all containers"
        docker-compose -f "$COMPOSE_FILE" restart
        print_success "All containers restarted"
        docker-compose -f "$COMPOSE_FILE" ps
        ;;
    
    "down")
        print_header "Stopping and removing containers"
        docker-compose -f "$COMPOSE_FILE" down
        print_success "Containers removed"
        ;;
    
    "clean")
        print_header "Removing containers AND volumes (WARNING: Data will be deleted)"
        read -p "Are you sure? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            docker-compose -f "$COMPOSE_FILE" down -v
            print_success "Containers and volumes removed"
        else
            print_warning "Operation cancelled"
        fi
        ;;
    
    "rebuild")
        print_header "Rebuilding Docker images"
        docker-compose -f "$COMPOSE_FILE" build --no-cache
        print_success "Images rebuilt"
        ;;
    
    "status")
        print_header "Container Status"
        docker-compose -f "$COMPOSE_FILE" ps
        ;;
    
    # Logs
    "logs")
        SERVICE="${2:-app}"
        if [ "$SERVICE" = "all" ]; then
            print_header "Showing all logs"
            docker-compose -f "$COMPOSE_FILE" logs -f
        else
            print_header "Showing logs for $SERVICE"
            docker-compose -f "$COMPOSE_FILE" logs -f "$SERVICE" --tail 100
        fi
        ;;
    
    # Database Commands
    "mongo")
        print_header "Connecting to MongoDB"
        docker exec -it ecommerce mongosh --username admin --password password --authenticationDatabase admin
        ;;
    
    "mongo-list-dbs")
        print_header "MongoDB Databases"
        docker exec ecommerce mongosh --username admin --password password --authenticationDatabase admin --eval "db.adminCommand('listDatabases').databases.forEach(db => print(db.name))"
        ;;
    
    "mongo-list-collections")
        print_header "MongoDB Collections in 'ecommerce' database"
        docker exec ecommerce mongosh --username admin --password password --authenticationDatabase admin ecommerce --eval "db.listCollections().toArray().forEach(col => print(col.name))"
        ;;
    
    "mongo-backup")
        BACKUP_DIR="${2:-.}"
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        BACKUP_PATH="$BACKUP_DIR/mongodb_backup_$TIMESTAMP"
        print_header "Backing up MongoDB to $BACKUP_PATH"
        docker run --rm -v e-commerce_mongodb_data:/data -v "$BACKUP_DIR":/backup mongo:7.0 \
            mongodump --uri="mongodb://admin:password@ecommerce:27017/ecommerce?authSource=admin" --out="/backup/mongodb_backup_$TIMESTAMP"
        print_success "MongoDB backup completed"
        ;;
    
    "redis")
        print_header "Connecting to Redis CLI"
        docker exec -it ecommerce-redis redis-cli
        ;;
    
    "redis-info")
        print_header "Redis Information"
        docker exec ecommerce-redis redis-cli info
        ;;
    
    "redis-keys")
        PATTERN="${2:-*}"
        print_header "Redis Keys matching '$PATTERN'"
        docker exec ecommerce-redis redis-cli keys "$PATTERN"
        ;;
    
    "redis-clear")
        print_header "Clearing Redis (WARNING: All data will be deleted)"
        read -p "Are you sure? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            docker exec ecommerce-redis redis-cli FLUSHALL
            print_success "Redis cleared"
        else
            print_warning "Operation cancelled"
        fi
        ;;
    
    # Health Checks
    "health")
        print_header "Service Health Status"
        echo ""
        echo "MongoDB:"
        if docker exec ecommerce mongosh --username admin --password password --authenticationDatabase admin --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
            print_success "MongoDB is healthy"
        else
            print_error "MongoDB is not responding"
        fi
        
        echo ""
        echo "Redis:"
        if docker exec ecommerce-redis redis-cli ping | grep -q "PONG"; then
            print_success "Redis is healthy"
        else
            print_error "Redis is not responding"
        fi
        
        echo ""
        echo "App Container:"
        STATUS=$(docker-compose -f "$COMPOSE_FILE" ps app --format "table {{.Status}}" 2>/dev/null | tail -1)
        if [[ $STATUS == *"Up"* ]]; then
            print_success "App container is running"
        else
            print_error "App container is not running"
        fi
        ;;
    
    # Development
    "build")
        print_header "Building project"
        docker exec ecommerce-app yarn build:all
        print_success "Build completed"
        ;;
    
    "test")
        print_header "Running tests"
        docker exec ecommerce-app yarn test:all
        ;;
    
    "lint")
        print_header "Running linters"
        docker exec ecommerce-app yarn lint
        ;;
    
    # Utilities
    "shell")
        SERVICE="${2:-app}"
        print_header "Opening shell in $SERVICE container"
        docker exec -it "ecommerce-$SERVICE" sh
        ;;
    
    "inspect")
        SERVICE="${2:-app}"
        print_header "Inspecting $SERVICE container"
        docker inspect "ecommerce-$SERVICE" | jq .
        ;;
    
    # Information
    "info")
        print_header "E-Commerce Docker Configuration"
        echo ""
        echo "Project Name: $PROJECT_NAME"
        echo "Compose File: $COMPOSE_FILE"
        echo ""
        print_header "Container Names"
        echo "• MongoDB: ecommerce"
        echo "• Redis: ecommerce-redis"
        echo "• App: ecommerce-app"
        echo ""
        print_header "Database Configuration"
        echo "• MongoDB Database: ecommerce"
        echo "• MongoDB Port: 27017"
        echo "• MongoDB User: admin"
        echo "• Redis Database: 0"
        echo "• Redis Port: 6379"
        echo ""
        print_header "Service Ports"
        echo "• Shell App: 3000"
        echo "• Admin App: 3001"
        echo "• Seller App: 3002"
        echo "• Storefront: 3003"
        echo "• Auth Service: 3011"
        echo "• Category Service: 3012"
        echo "• Coupon Service: 3013"
        echo "• Product Service: 3014"
        echo "• Order Service: 3015"
        echo "• GraphQL Gateway: 4000"
        echo "• Storybook: 6006"
        ;;
    
    "help"|"-h"|"--help"|"")
        echo "E-Commerce Platform - Docker Commands"
        echo ""
        echo "Usage: $0 <command> [arguments]"
        echo ""
        echo "Container Management:"
        echo "  start           Start all containers"
        echo "  stop            Stop all containers"
        echo "  restart         Restart all containers"
        echo "  down            Stop and remove containers"
        echo "  clean           Remove containers AND volumes (data will be deleted)"
        echo "  rebuild         Rebuild Docker images"
        echo "  status          Show container status"
        echo ""
        echo "Logs:"
        echo "  logs [service]  Show logs for service (default: app, use 'all' for all services)"
        echo ""
        echo "MongoDB Commands:"
        echo "  mongo                   Connect to MongoDB CLI"
        echo "  mongo-list-dbs          List all databases"
        echo "  mongo-list-collections  List collections in ecommerce database"
        echo "  mongo-backup [path]     Backup MongoDB (default: current directory)"
        echo ""
        echo "Redis Commands:"
        echo "  redis                   Connect to Redis CLI"
        echo "  redis-info              Show Redis information"
        echo "  redis-keys [pattern]    Show Redis keys matching pattern (default: *)"
        echo "  redis-clear             Clear all Redis data"
        echo ""
        echo "Health & Info:"
        echo "  health                  Check health of all services"
        echo "  info                    Show Docker configuration info"
        echo ""
        echo "Development:"
        echo "  build                   Build the project"
        echo "  test                    Run tests"
        echo "  lint                    Run linters"
        echo ""
        echo "Utilities:"
        echo "  shell [service]         Open shell in container (default: app)"
        echo "  inspect [service]       Inspect container configuration (default: app)"
        echo "  help                    Show this help message"
        ;;
    
    *)
        print_error "Unknown command: $1"
        echo "Run '$0 help' for available commands"
        exit 1
        ;;
esac
