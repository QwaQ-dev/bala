# Makefile for Bala project

.PHONY: help build up down restart logs clean frontend-logs backend-logs db-logs dev-up

# Default target
help:
	@echo "Available commands:"
	@echo "  build      - Build all Docker images"
	@echo "  up         - Start all services (production)"
	@echo "  dev-up     - Start all services (development mode)"
	@echo "  down       - Stop all services"
	@echo "  restart    - Restart all services"
	@echo "  logs       - Show logs for all services"
	@echo "  frontend-logs - Show frontend logs"
	@echo "  backend-logs  - Show backend logs"
	@echo "  db-logs    - Show database logs"
	@echo "  clean      - Clean Docker system"
	@echo "  rebuild    - Clean build and start"

# Build all images
build:
	docker-compose build --no-cache

# Start services (production)
up:
	docker-compose up -d

# Start services (development)
dev-up:
	docker-compose -f docker-compose.yml -f docker-compose.local.yml up -d

# Stop services
down:
	docker-compose down

# Restart services
restart: down up

# Show logs
logs:
	docker-compose logs -f

# Frontend specific logs
frontend-logs:
	docker-compose logs -f frontend

# Backend specific logs
backend-logs:
	docker-compose logs -f backend

# Database specific logs
db-logs:
	docker-compose logs -f db

# Clean Docker system
clean:
	docker-compose down -v --remove-orphans
	docker system prune -af
	docker volume prune -f

# Complete rebuild
rebuild: clean build up
