#!/bin/bash

# Bradán Accountants GCP Deployment Script
# This script automates the deployment of the Bradán Accountants application to Google Cloud Platform.
# It sets up all necessary resources in the europe-west1 (Ireland) region.

set -e  # Exit immediately if a command exits with a non-zero status

# Color codes for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration - MODIFY THESE VALUES
PROJECT_ID="project-47542"  # Replace with your GCP project ID
REGION="europe-west1"             # Ireland region
ZONE="europe-west1-b"             # Default zone in Ireland region
APP_NAME="bradan-accountants"     # Application name
DB_INSTANCE_NAME="${APP_NAME}-db" # Database instance name
REDIS_INSTANCE_NAME="${APP_NAME}-redis" # Redis instance name
STORAGE_BUCKET_NAME="${APP_NAME}-uploads" # Storage bucket name
VPC_NETWORK_NAME="${APP_NAME}-network" # VPC network name
SERVICE_ACCOUNT_NAME="${APP_NAME}-sa" # Service account name
BACKEND_SERVICE_NAME="${APP_NAME}-backend" # Backend service name
DB_NAME="bradan_accountants"      # Database name
DB_USER="bradan_admin"            # Database user
DB_PASSWORD=$(openssl rand -base64 16) # Generate a random password
JWT_SECRET=$(openssl rand -base64 32)  # Generate a random JWT secret
ENCRYPTION_KEY=$(openssl rand -base64 32) # Generate a random encryption key

# Function to print section headers
print_section() {
    echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

# Function to print success messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error messages
print_error() {
    echo -e "${RED}✗ $1${NC}"
    exit 1
}

# Function to print warning messages
print_warning() {
    echo -e "${YELLOW}! $1${NC}"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
print_section "Checking Prerequisites"

# Check if gcloud is installed
if ! command_exists gcloud; then
    print_error "Google Cloud SDK (gcloud) is not installed. Please install it from https://cloud.google.com/sdk/docs/install"
fi

# Check if docker is installed
if ! command_exists docker; then
    print_error "Docker is not installed. Please install it from https://docs.docker.com/get-docker/"
fi

# Check if firebase CLI is installed
if ! command_exists firebase; then
    print_warning "Firebase CLI is not installed. It will be installed during the deployment process."
    npm install -g firebase-tools
fi

# Check if terraform is installed
if ! command_exists terraform; then
    print_warning "Terraform is not installed. It will be installed during the deployment process."
    # Install Terraform based on OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
        sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
        sudo apt-get update && sudo apt-get install terraform
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew tap hashicorp/tap
        brew install hashicorp/tap/terraform
    else
        print_error "Unsupported OS for automatic Terraform installation. Please install Terraform manually from https://www.terraform.io/downloads.html"
    fi
fi

# Authenticate with Google Cloud
print_section "Authenticating with Google Cloud"
gcloud auth login

# Set the project
print_section "Setting up GCP Project"
gcloud config set project $PROJECT_ID
print_success "Project set to $PROJECT_ID"

# Enable required APIs
print_section "Enabling Required APIs"
gcloud services enable cloudbuild.googleapis.com \
    containerregistry.googleapis.com \
    run.googleapis.com \
    sqladmin.googleapis.com \
    redis.googleapis.com \
    secretmanager.googleapis.com \
    storage.googleapis.com \
    compute.googleapis.com \
    servicenetworking.googleapis.com \
    vpcaccess.googleapis.com \
    firestore.googleapis.com \
    cloudresourcemanager.googleapis.com \
    iam.googleapis.com
print_success "APIs enabled"

# Create VPC network
print_section "Setting up VPC Network"
if ! gcloud compute networks describe $VPC_NETWORK_NAME &>/dev/null; then
    gcloud compute networks create $VPC_NETWORK_NAME --subnet-mode=auto
    print_success "VPC network created: $VPC_NETWORK_NAME"
else
    print_warning "VPC network already exists: $VPC_NETWORK_NAME"
fi

# Create service account
print_section "Setting up Service Account"
if ! gcloud iam service-accounts describe ${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com &>/dev/null; then
    gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
        --display-name="$APP_NAME Service Account"
    print_success "Service account created: ${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
else
    print_warning "Service account already exists: ${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
fi

# Grant necessary roles to the service account
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/storage.objectAdmin"

print_success "Service account roles assigned"

# Create Cloud Storage bucket
print_section "Setting up Cloud Storage"
if ! gsutil ls -b gs://$STORAGE_BUCKET_NAME &>/dev/null; then
    gsutil mb -l $REGION gs://$STORAGE_BUCKET_NAME
    gsutil iam ch serviceAccount:${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com:objectAdmin gs://$STORAGE_BUCKET_NAME
    print_success "Storage bucket created: $STORAGE_BUCKET_NAME"
else
    print_warning "Storage bucket already exists: $STORAGE_BUCKET_NAME"
fi

# Set up Cloud SQL for PostgreSQL
print_section "Setting up Cloud SQL for PostgreSQL"
if ! gcloud sql instances describe $DB_INSTANCE_NAME &>/dev/null; then
    gcloud sql instances create $DB_INSTANCE_NAME \
        --database-version=POSTGRES_14 \
        --tier=db-g1-small \
        --region=$REGION \
        --storage-type=SSD \
        --storage-size=10GB \
        --availability-type=zonal \
        --backup-start-time=02:00 \
        --enable-bin-log \
        --root-password=$DB_PASSWORD
    print_success "Cloud SQL instance created: $DB_INSTANCE_NAME"
else
    print_warning "Cloud SQL instance already exists: $DB_INSTANCE_NAME"
fi

# Create database
if ! gcloud sql databases describe $DB_NAME --instance=$DB_INSTANCE_NAME &>/dev/null; then
    gcloud sql databases create $DB_NAME --instance=$DB_INSTANCE_NAME
    print_success "Database created: $DB_NAME"
else
    print_warning "Database already exists: $DB_NAME"
fi

# Create database user
if ! gcloud sql users describe $DB_USER --instance=$DB_INSTANCE_NAME &>/dev/null; then
    gcloud sql users create $DB_USER \
        --instance=$DB_INSTANCE_NAME \
        --password=$DB_PASSWORD
    print_success "Database user created: $DB_USER"
else
    print_warning "Database user already exists: $DB_USER"
fi

# Get the Cloud SQL connection name
DB_CONNECTION_NAME=$(gcloud sql instances describe $DB_INSTANCE_NAME --format='value(connectionName)')
print_success "Database connection name: $DB_CONNECTION_NAME"

# Set up Memorystore for Redis
print_section "Setting up Memorystore for Redis"
if ! gcloud redis instances describe $REDIS_INSTANCE_NAME --region=$REGION &>/dev/null; then
    gcloud redis instances create $REDIS_INSTANCE_NAME \
        --size=1 \
        --region=$REGION \
        --zone=$ZONE \
        --redis-version=redis_6_x \
        --network=$VPC_NETWORK_NAME
    print_success "Redis instance created: $REDIS_INSTANCE_NAME"
else
    print_warning "Redis instance already exists: $REDIS_INSTANCE_NAME"
fi

# Get the Redis IP address
REDIS_IP=$(gcloud redis instances describe $REDIS_INSTANCE_NAME --region=$REGION --format='value(host)')
print_success "Redis IP address: $REDIS_IP"

# Set up Secret Manager
print_section "Setting up Secret Manager"

# Create secrets
create_secret() {
    local secret_name=$1
    local secret_value=$2
    
    if ! gcloud secrets describe $secret_name &>/dev/null; then
        echo -n "$secret_value" | gcloud secrets create $secret_name --data-file=-
        gcloud secrets add-iam-policy-binding $secret_name \
            --member="serviceAccount:${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
            --role="roles/secretmanager.secretAccessor"
        print_success "Secret created: $secret_name"
    else
        print_warning "Secret already exists: $secret_name"
    fi
}

# Create necessary secrets
create_secret "db-password" "$DB_PASSWORD"
create_secret "jwt-secret" "$JWT_SECRET"
create_secret "encryption-key" "$ENCRYPTION_KEY"

# Create .env file for backend
print_section "Creating Environment Configuration"
cat > api/.env.production << EOF
# Server Configuration
PORT=8080

# Database Configuration
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost/${DB_NAME}?host=/cloudsql/${DB_CONNECTION_NAME}"

# Security
JWT_SECRET=${JWT_SECRET}
ENCRYPTION_KEY=${ENCRYPTION_KEY}

# Logging
LOG_LEVEL=info
LOG_DIR=logs

# Redis Configuration
REDIS_HOST=${REDIS_IP}
REDIS_PORT=6379

# Import Settings
IMPORT_BATCH_SIZE=1000
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads/imports
EOF
print_success "Environment configuration created: api/.env.production"

# Build and deploy backend
print_section "Building and Deploying Backend"

# Create Dockerfile for backend if it doesn't exist
if [ ! -f api/Dockerfile ]; then
    cat > api/Dockerfile << EOF
FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Expose the port
EXPOSE 8080

# Start the application
CMD ["npm", "start"]
EOF
    print_success "Dockerfile created for backend"
fi

# Build and push Docker image
cd api
docker build -t gcr.io/$PROJECT_ID/$BACKEND_SERVICE_NAME .
docker push gcr.io/$PROJECT_ID/$BACKEND_SERVICE_NAME
cd ..
print_success "Backend Docker image built and pushed"

# Deploy to Cloud Run
gcloud run deploy $BACKEND_SERVICE_NAME \
    --image gcr.io/$PROJECT_ID/$BACKEND_SERVICE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --add-cloudsql-instances $DB_CONNECTION_NAME \
    --service-account ${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com \
    --set-env-vars "DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@localhost/${DB_NAME}?host=/cloudsql/${DB_CONNECTION_NAME},REDIS_HOST=${REDIS_IP},REDIS_PORT=6379,JWT_SECRET=${JWT_SECRET},ENCRYPTION_KEY=${ENCRYPTION_KEY}"
print_success "Backend deployed to Cloud Run: $BACKEND_SERVICE_NAME"

# Get the backend URL
BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE_NAME --region=$REGION --format='value(status.url)')
print_success "Backend URL: $BACKEND_URL"

# Build and deploy frontend
print_section "Building and Deploying Frontend"

# Create .env file for frontend
cat > app/.env.production << EOF
VITE_API_URL=${BACKEND_URL}
EOF
print_success "Environment configuration created: app/.env.production"

# Build frontend
cd app
npm install
npm run build
cd ..
print_success "Frontend built"

# Initialize Firebase
if [ ! -f firebase.json ]; then
    firebase init hosting --project $PROJECT_ID
    # Update firebase.json to point to the correct build directory
    cat > firebase.json << EOF
{
  "hosting": {
    "public": "app/dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
EOF
    print_success "Firebase initialized"
fi

# Deploy to Firebase Hosting
firebase deploy --only hosting --project $PROJECT_ID
print_success "Frontend deployed to Firebase Hosting"

# Get the frontend URL
FRONTEND_URL=$(firebase hosting:info --project $PROJECT_ID | grep "Hosting URL" | cut -d' ' -f3)
print_success "Frontend URL: $FRONTEND_URL"

# Create a docs directory and deployment guide
print_section "Creating Deployment Documentation"
mkdir -p docs
cat > docs/gcp-deployment-guide.md << EOF
# GCP Deployment Guide for Bradán Accountants

This guide provides step-by-step instructions for deploying the Bradán Accountants application to Google Cloud Platform (GCP).

## Prerequisites

- Google Cloud Platform account with a project set up
- Google Cloud SDK installed locally
- Docker installed locally
- Firebase CLI installed locally
- Terraform installed locally (optional, for infrastructure as code)

## Deployment Steps

### 1. Set Up GCP Project and Enable APIs

\`\`\`bash
# Set the project
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com \\
    containerregistry.googleapis.com \\
    run.googleapis.com \\
    sqladmin.googleapis.com \\
    redis.googleapis.com \\
    secretmanager.googleapis.com \\
    storage.googleapis.com \\
    compute.googleapis.com \\
    servicenetworking.googleapis.com \\
    vpcaccess.googleapis.com \\
    firestore.googleapis.com \\
    cloudresourcemanager.googleapis.com \\
    iam.googleapis.com
\`\`\`

### 2. Set Up VPC Network

\`\`\`bash
# Create VPC network
gcloud compute networks create bradan-accountants-network --subnet-mode=auto
\`\`\`

### 3. Create Service Account

\`\`\`bash
# Create service account
gcloud iam service-accounts create bradan-accountants-sa \\
    --display-name="Bradán Accountants Service Account"

# Grant necessary roles
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \\
    --member="serviceAccount:bradan-accountants-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \\
    --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \\
    --member="serviceAccount:bradan-accountants-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \\
    --role="roles/secretmanager.secretAccessor"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \\
    --member="serviceAccount:bradan-accountants-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \\
    --role="roles/storage.objectAdmin"
\`\`\`

### 4. Create Cloud Storage Bucket

\`\`\`bash
# Create bucket
gsutil mb -l europe-west1 gs://bradan-accountants-uploads

# Set permissions
gsutil iam ch serviceAccount:bradan-accountants-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com:objectAdmin gs://bradan-accountants-uploads
\`\`\`

### 5. Set Up Cloud SQL for PostgreSQL

\`\`\`bash
# Create Cloud SQL instance
gcloud sql instances create bradan-accountants-db \\
    --database-version=POSTGRES_14 \\
    --tier=db-g1-small \\
    --region=europe-west1 \\
    --storage-type=SSD \\
    --storage-size=10GB \\
    --availability-type=zonal \\
    --backup-start-time=02:00 \\
    --enable-bin-log \\
    --root-password=YOUR_PASSWORD

# Create database
gcloud sql databases create bradan_accountants --instance=bradan-accountants-db

# Create user
gcloud sql users create bradan_admin \\
    --instance=bradan-accountants-db \\
    --password=YOUR_PASSWORD
\`\`\`

### 6. Set Up Memorystore for Redis

\`\`\`bash
# Create Redis instance
gcloud redis instances create bradan-accountants-redis \\
    --size=1 \\
    --region=europe-west1 \\
    --zone=europe-west1-b \\
    --redis-version=redis_6_x \\
    --network=bradan-accountants-network
\`\`\`

### 7. Set Up Secret Manager

\`\`\`bash
# Create secrets
echo -n "YOUR_DB_PASSWORD" | gcloud secrets create db-password --data-file=-
echo -n "YOUR_JWT_SECRET" | gcloud secrets create jwt-secret --data-file=-
echo -n "YOUR_ENCRYPTION_KEY" | gcloud secrets create encryption-key --data-file=-

# Grant access
gcloud secrets add-iam-policy-binding db-password \\
    --member="serviceAccount:bradan-accountants-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \\
    --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding jwt-secret \\
    --member="serviceAccount:bradan-accountants-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \\
    --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding encryption-key \\
    --member="serviceAccount:bradan-accountants-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \\
    --role="roles/secretmanager.secretAccessor"
\`\`\`

### 8. Build and Deploy Backend

\`\`\`bash
# Create Dockerfile
cat > api/Dockerfile << EOF
FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Expose the port
EXPOSE 8080

# Start the application
CMD ["npm", "start"]
EOF

# Build and push Docker image
cd api
docker build -t gcr.io/YOUR_PROJECT_ID/bradan-accountants-backend .
docker push gcr.io/YOUR_PROJECT_ID/bradan-accountants-backend
cd ..

# Deploy to Cloud Run
gcloud run deploy bradan-accountants-backend \\
    --image gcr.io/YOUR_PROJECT_ID/bradan-accountants-backend \\
    --platform managed \\
    --region europe-west1 \\
    --allow-unauthenticated \\
    --add-cloudsql-instances YOUR_DB_CONNECTION_NAME \\
    --service-account bradan-accountants-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com \\
    --set-env-vars "DATABASE_URL=postgresql://bradan_admin:YOUR_DB_PASSWORD@localhost/bradan_accountants?host=/cloudsql/YOUR_DB_CONNECTION_NAME,REDIS_HOST=YOUR_REDIS_IP,REDIS_PORT=6379,JWT_SECRET=YOUR_JWT_SECRET,ENCRYPTION_KEY=YOUR_ENCRYPTION_KEY"
\`\`\`

### 9. Build and Deploy Frontend

\`\`\`bash
# Create .env file
cat > app/.env.production << EOF
VITE_API_URL=YOUR_BACKEND_URL
EOF

# Build frontend
cd app
npm install
npm run build
cd ..

# Initialize Firebase
firebase init hosting --project YOUR_PROJECT_ID

# Update firebase.json
cat > firebase.json << EOF
{
  "hosting": {
    "public": "app/dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
EOF

# Deploy to Firebase Hosting
firebase deploy --only hosting --project YOUR_PROJECT_ID
\`\`\`

## Post-Deployment Steps

### 1. Run Database Migrations

\`\`\`bash
# Connect to Cloud SQL instance
gcloud sql connect bradan-accountants-db --user=bradan_admin

# Run Prisma migrations
cd api
npx prisma migrate deploy
npx prisma db seed
\`\`\`

### 2. Set Up Monitoring and Alerts

\`\`\`bash
# Set up Cloud Monitoring
gcloud monitoring dashboards create --config-from-file=monitoring-dashboard.json

# Set up alerts
gcloud alpha monitoring policies create --policy-from-file=alerts-policy.json
\`\`\`

### 3. Set Up Cloud Armor for Security

\`\`\`bash
# Create security policy
gcloud compute security-policies create bradan-accountants-policy \\
    --description "Security policy for Bradán Accountants"

# Add rules
gcloud compute security-policies rules create 1000 \\
    --security-policy bradan-accountants-policy \\
    --description "Block XSS attacks" \\
    --expression "evaluatePreconfiguredExpr('xss-stable')" \\
    --action "deny-403"
\`\`\`

## Troubleshooting

### Common Issues

1. **Cloud SQL Connection Issues**
   - Check that the Cloud SQL Auth Proxy is running
   - Verify service account permissions
   - Check network connectivity

2. **Redis Connection Issues**
   - Verify VPC network configuration
   - Check Redis instance status
   - Verify service account permissions

3. **Deployment Failures**
   - Check Cloud Build logs
   - Verify Docker image builds correctly
   - Check service account permissions

### Getting Help

For additional assistance, please contact the DevOps team or refer to the GCP documentation.
EOF
print_success "Deployment guide created: docs/gcp-deployment-guide.md"

# Final summary
print_section "Deployment Summary"
echo -e "Bradán Accountants has been successfully deployed to Google Cloud Platform!"
echo -e "Backend URL: ${BACKEND_URL}"
echo -e "Frontend URL: ${FRONTEND_URL}"
echo -e "Database: Cloud SQL PostgreSQL instance ${DB_INSTANCE_NAME}"
echo -e "Redis: Memorystore instance ${REDIS_INSTANCE_NAME}"
echo -e "Storage: Cloud Storage bucket ${STORAGE_BUCKET_NAME}"
echo -e "\nImportant: Keep your database password and secrets secure!"
echo -e "Database Password: ${DB_PASSWORD}"
echo -e "JWT Secret: ${JWT_SECRET}"
echo -e "Encryption Key: ${ENCRYPTION_KEY}"
echo -e "\nFor detailed deployment instructions, see docs/gcp-deployment-guide.md"

print_success "Deployment completed successfully!"
