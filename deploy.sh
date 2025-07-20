#!/bin/bash

# Users CRUD API Docker Deployment Script
# This script builds and deploys the Node.js API using Docker

set -e  # Exit on any error

# Configuration
IMAGE_NAME="users-crud-api"
CONTAINER_NAME="users-crud-api-container"
PORT=3000
DATA_DIR="./data"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Function to create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p "$DATA_DIR"
    mkdir -p "./logs"
    
    # Set proper permissions
    chmod 755 "$DATA_DIR"
    chmod 755 "./logs"
    
    print_success "Directories created successfully"
}

# Function to stop and remove existing container
cleanup_existing() {
    print_status "Cleaning up existing containers..."
    
    if docker ps -a --format "table {{.Names}}" | grep -q "$CONTAINER_NAME"; then
        docker stop "$CONTAINER_NAME" 2>/dev/null || true
        docker rm "$CONTAINER_NAME" 2>/dev/null || true
        print_success "Existing container cleaned up"
    else
        print_status "No existing container found"
    fi
}

# Function to build Docker image
build_image() {
    print_status "Building Docker image..."
    
    docker build -t "$IMAGE_NAME" .
    
    if [ $? -eq 0 ]; then
        print_success "Docker image built successfully"
    else
        print_error "Failed to build Docker image"
        exit 1
    fi
}

# Function to run container
run_container() {
    print_status "Starting container..."
    
    docker run -d \
        --name "$CONTAINER_NAME" \
        -p "$PORT:3000" \
        -v "$(pwd)/$DATA_DIR:/app/data" \
        -v "$(pwd)/logs:/app/logs" \
        --restart unless-stopped \
        "$IMAGE_NAME"
    
    if [ $? -eq 0 ]; then
        print_success "Container started successfully"
    else
        print_error "Failed to start container"
        exit 1
    fi
}

# Function to check container health
check_health() {
    print_status "Checking container health..."
    
    # Wait for container to start
    sleep 5
    
    # Check if container is running
    if docker ps --format "table {{.Names}}" | grep -q "$CONTAINER_NAME"; then
        print_success "Container is running"
    else
        print_error "Container is not running"
        docker logs "$CONTAINER_NAME"
        exit 1
    fi
    
    # Check API health
    print_status "Checking API health..."
    if curl -f -s "http://localhost:$PORT/" > /dev/null; then
        print_success "API is responding correctly"
    else
        print_warning "API health check failed, but container is running"
        print_status "Container logs:"
        docker logs "$CONTAINER_NAME"
    fi
}

# Function to display deployment info
show_info() {
    echo ""
    print_success "Deployment completed successfully!"
    echo ""
    echo "Container Information:"
    echo "  - Container Name: $CONTAINER_NAME"
    echo "  - Image Name: $IMAGE_NAME"
    echo "  - Port: $PORT"
    echo "  - Data Directory: $(pwd)/$DATA_DIR"
    echo ""
    echo "Useful Commands:"
    echo "  - View logs: docker logs $CONTAINER_NAME"
    echo "  - Stop container: docker stop $CONTAINER_NAME"
    echo "  - Start container: docker start $CONTAINER_NAME"
    echo "  - Restart container: docker restart $CONTAINER_NAME"
    echo "  - Remove container: docker rm -f $CONTAINER_NAME"
    echo ""
    echo "API Endpoints:"
    echo "  - Health Check: http://localhost:$PORT/"
    echo "  - API Documentation: http://localhost:$PORT/"
    echo "  - Users API: http://localhost:$PORT/users"
    echo ""
}

# Function to deploy using docker-compose
deploy_with_compose() {
    print_status "Deploying with Docker Compose..."
    
    # Stop existing services
    docker-compose down 2>/dev/null || true
    
    # Build and start services
    docker-compose up -d --build
    
    if [ $? -eq 0 ]; then
        print_success "Docker Compose deployment completed"
        
        echo ""
        print_success "Services deployed successfully!"
        echo ""
        echo "Service Information:"
        echo "  - API Service: users-api (port 3000)"
        echo "  - Nginx Proxy: nginx (port 80, 443)"
        echo "  - Data Directory: $(pwd)/data"
        echo ""
        echo "Useful Commands:"
        echo "  - View logs: docker-compose logs -f"
        echo "  - Stop services: docker-compose down"
        echo "  - Restart services: docker-compose restart"
        echo "  - Scale services: docker-compose up -d --scale users-api=3"
        echo ""
        echo "API Endpoints:"
        echo "  - Direct API: http://localhost:3000/"
        echo "  - Through Nginx: http://localhost/"
        echo ""
    else
        print_error "Docker Compose deployment failed"
        exit 1
    fi
}

# Main deployment function
main() {
    echo "=========================================="
    echo "    Users CRUD API Docker Deployment"
    echo "=========================================="
    echo ""
    
    # Check if docker-compose flag is provided
    if [ "$1" = "--compose" ]; then
        check_docker
        create_directories
        deploy_with_compose
    else
        check_docker
        create_directories
        cleanup_existing
        build_image
        run_container
        check_health
        show_info
    fi
}

# Handle command line arguments
case "${1:-}" in
    --compose)
        main --compose
        ;;
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --compose    Deploy using Docker Compose (includes nginx)"
        echo "  --help, -h   Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0              # Deploy with plain Docker"
        echo "  $0 --compose    # Deploy with Docker Compose"
        ;;
    *)
        main
        ;;
esac 