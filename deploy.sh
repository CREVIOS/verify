#!/bin/bash

# Production Deployment Script for IPO Document Verification System
# Usage: ./deploy.sh [start|stop|restart|logs|status]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENV_FILE=".env"
COMPOSE_FILE="docker-compose.prod.yml"

# Functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}! $1${NC}"
}

print_info() {
    echo -e "→ $1"
}

check_env() {
    if [ ! -f "$ENV_FILE" ]; then
        print_error "Environment file $ENV_FILE not found!"
        print_info "Copy .env.production.example to .env and fill in your values"
        exit 1
    fi
    print_success "Environment file found"
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed!"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed!"
        exit 1
    fi
    print_success "Docker and Docker Compose are installed"
}

run_migrations() {
    print_info "Running database migrations..."
    docker-compose -f $COMPOSE_FILE exec -T backend alembic upgrade head
    print_success "Migrations completed"
}

start_services() {
    print_info "Starting services..."
    docker-compose -f $COMPOSE_FILE up -d
    print_success "Services started"

    sleep 10
    print_info "Waiting for services to be ready..."

    # Wait for backend health check
    max_attempts=30
    attempt=0
    while [ $attempt -lt $max_attempts ]; do
        if curl -f http://localhost:8000/api/health > /dev/null 2>&1; then
            print_success "Backend is ready"
            break
        fi
        attempt=$((attempt + 1))
        sleep 2
        print_info "Waiting for backend... ($attempt/$max_attempts)"
    done

    if [ $attempt -eq $max_attempts ]; then
        print_error "Backend failed to start within timeout"
        exit 1
    fi

    # Run migrations
    run_migrations

    print_success "All services are ready!"
    show_status
}

stop_services() {
    print_info "Stopping services..."
    docker-compose -f $COMPOSE_FILE down
    print_success "Services stopped"
}

restart_services() {
    stop_services
    start_services
}

show_logs() {
    docker-compose -f $COMPOSE_FILE logs -f --tail=100 $1
}

show_status() {
    echo ""
    print_info "Service Status:"
    docker-compose -f $COMPOSE_FILE ps

    echo ""
    print_info "Health Checks:"
    echo "Frontend:  http://localhost:3000"
    echo "Backend:   http://localhost:8000/api/docs"
    echo "Flower:    http://localhost:5555"
    echo "RabbitMQ:  http://localhost:15672 (admin/changeme)"

    echo ""
    print_info "Service URLs:"
    curl -s http://localhost:8000/api/health | python3 -m json.tool 2>/dev/null || echo "Backend not responding"
}

backup_database() {
    print_info "Creating database backup..."
    timestamp=$(date +%Y%m%d_%H%M%S)
    backup_file="backup_${timestamp}.sql"

    docker-compose -f $COMPOSE_FILE exec -T postgres pg_dump -U postgres ipo_verification > $backup_file
    print_success "Backup created: $backup_file"
}

# Main script
case "$1" in
    start)
        check_env
        check_docker
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    logs)
        show_logs $2
        ;;
    status)
        show_status
        ;;
    backup)
        backup_database
        ;;
    migrate)
        run_migrations
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|logs|status|backup|migrate}"
        echo ""
        echo "Commands:"
        echo "  start   - Start all services"
        echo "  stop    - Stop all services"
        echo "  restart - Restart all services"
        echo "  logs    - Show logs (optional: service name)"
        echo "  status  - Show service status"
        echo "  backup  - Create database backup"
        echo "  migrate - Run database migrations"
        exit 1
        ;;
esac
