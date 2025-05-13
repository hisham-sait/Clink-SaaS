# Docker Setup for Clink SaaS

This document provides instructions for running the Clink SaaS application using Docker containers.

## Overview

The application has been containerized with Docker, including:

- API (Node.js backend)
- App (React frontend)
- PostgreSQL database
- Redis for queue processing
- Authelia authentication service (optional)
- Nginx reverse proxy (optional)

## Prerequisites

- Docker and Docker Compose installed on your system
- Git to clone the repository

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Clink-SaaS
```

### 2. Start the Docker Containers

You have two options for starting the containers:

#### Basic Setup (API, App, DB, Redis)

Run the start script to launch the basic containers:

```bash
./docker-start.sh
```

This will start the core services in detached mode.

#### Full Setup (including Auth Service)

To start all services including Authelia authentication and Nginx:

```bash
./docker-start-full.sh
```

This will start all services including the authentication layer.

### 3. Initialize the Database (First Time Only)

If this is your first time running the application, you need to initialize the database:

```bash
./docker-init-db.sh
```

This script will:
- Generate the Prisma client
- Run database migrations
- Seed the database with initial data

### 4. Access the Application

Once all containers are running, you can access:

- Frontend: http://localhost
- Backend API: http://localhost:3000

### 5. Stopping the Application

To stop the containers:

#### Basic Setup

```bash
./docker-stop.sh
```

#### Full Setup

```bash
./docker-stop-full.sh
```

### 6. Checking Container Status

To check the status of all containers:

```bash
./docker-status.sh
```

This will display:
- Running status of all containers
- Port mappings
- Resource usage statistics

## Container Information

### API Container

- Built from the Dockerfile in the `api` directory
- Exposes port 3000
- Connects to PostgreSQL and Redis
- Environment variables are set in the docker-compose.yml file

### App Container

- Built from the Dockerfile in the `app` directory
- Serves the React frontend using Nginx
- Exposes port 80
- Custom Nginx configuration for SPA routing

### Database Container

- Uses PostgreSQL 14 Alpine image
- Data is persisted in a Docker volume
- Exposes port 5432
- Default credentials:
  - User: postgres
  - Password: postgres123
  - Database: clink_saas

### Redis Container

- Uses Redis Alpine image
- Data is persisted in a Docker volume
- Exposes port 6379

### Authelia Container (Full Setup Only)

- Uses the official Authelia image
- Provides authentication and SSO capabilities
- Exposes port 9091
- Configuration stored in ./auth/config directory

### Nginx Container (Full Setup Only)

- Uses Nginx Alpine image
- Acts as a reverse proxy for secure access
- Exposes port 443 for HTTPS
- Configuration from auth/integration-examples/nginx

## Development Workflow

### Making Changes to the Frontend

1. Make your changes to the frontend code
2. Rebuild the frontend container:
   ```bash
   docker-compose build app
   docker-compose up -d app
   ```

### Making Changes to the API

1. Make your changes to the API code
2. Rebuild the API container:
   ```bash
   docker-compose build api
   docker-compose up -d api
   ```

### Database Changes

If you need to make changes to the database schema:

1. Update the Prisma schema in `api/prisma/schema.prisma`
2. Run migrations:
   ```bash
   docker-compose exec api npx prisma migrate dev --name your_migration_name
   ```

## Troubleshooting

### Container Logs

To view logs for a specific container:

```bash
docker-compose logs api    # API logs
docker-compose logs app    # Frontend logs
docker-compose logs db     # Database logs
docker-compose logs redis  # Redis logs
```

Add the `-f` flag to follow the logs in real-time:

```bash
docker-compose logs -f api
```

### Restarting Containers

If you encounter issues, try restarting the containers:

```bash
docker-compose restart api   # Restart API
docker-compose restart app   # Restart frontend
docker-compose restart db    # Restart database
docker-compose restart redis # Restart Redis
```

### Database Reset

To completely reset the database:

```bash
docker-compose down
docker volume rm clink-saas_postgres_data
./docker-start.sh
./docker-init-db.sh
```

## Advanced Configuration

### Customizing Environment Variables

Edit the `docker-compose.yml` file to modify environment variables for each service.

### Persistent Data

All data is stored in Docker volumes:
- `postgres_data`: Database files
- `redis_data`: Redis data
- `api_uploads`: Uploaded files
- `api_logs`: API logs
- `nginx_logs`: Nginx logs (full setup only)

These volumes persist even when containers are stopped or removed.

## Docker Compose Files

The project includes two Docker Compose configuration files:

1. `docker-compose.yml` - Basic setup with API, App, DB, and Redis
2. `docker-compose-full.yml` - Complete setup including authentication services

Choose the appropriate configuration based on your needs.
