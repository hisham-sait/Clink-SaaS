# GCP Deployment Guide for Bradán Accountants

This guide provides detailed step-by-step instructions for deploying the Bradán Accountants application to Google Cloud Platform (GCP) in the europe-west1 (Ireland) region.

## Prerequisites

Before you begin, ensure you have the following:

- Google Cloud Platform account with a project set up
- Google Cloud SDK installed and configured on your local machine
- Docker installed for building container images
- Node.js and npm installed
- Git repository cloned locally

## 1. Initial Setup

### 1.1 Install Required Tools

```bash
# Install Google Cloud SDK (if not already installed)
# For macOS
brew install --cask google-cloud-sdk

# For Linux
# Follow instructions at https://cloud.google.com/sdk/docs/install

# Install Firebase CLI
npm install -g firebase-tools

# Login to Google Cloud
gcloud auth login

# Configure Docker to use Google Container Registry
gcloud auth configure-docker
```

### 1.2 Set Environment Variables

```bash
# Set your GCP project ID
export PROJECT_ID="your-gcp-project-id"

# Set the region to Ireland
export REGION="europe-west1"
export ZONE="europe-west1-b"

# Set application name
export APP_NAME="bradan-accountants"

# Set resource names
export DB_INSTANCE_NAME="${APP_NAME}-db"
export REDIS_INSTANCE_NAME="${APP_NAME}-redis"
export STORAGE_BUCKET_NAME="${APP_NAME}-uploads"
export VPC_NETWORK_NAME="${APP_NAME}-network"
export SERVICE_ACCOUNT_NAME="${APP_NAME}-sa"
export BACKEND_SERVICE_NAME="${APP_NAME}-backend"

# Set database configuration
export DB_NAME="bradan_accountants"
export DB_USER="bradan_admin"
export DB_PASSWORD=$(openssl rand -base64 16)

# Generate secrets
export JWT_SECRET=$(openssl rand -base64 32)
export ENCRYPTION_KEY=$(openssl rand -base64 32)

# Save these values to a secure location
echo "Project ID: $PROJECT_ID" > deployment-config.txt
echo "Database Password: $DB_PASSWORD" >> deployment-config.txt
echo "JWT Secret: $JWT_SECRET" >> deployment-config.txt
echo "Encryption Key: $ENCRYPTION_KEY" >> deployment-config.txt
```

## 2. Set Up GCP Project and Enable APIs

### 2.1 Set the Project

```bash
gcloud config set project $PROJECT_ID
```

### 2.2 Enable Required APIs

```bash
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
```

## 3. Set Up Networking and Security

### 3.1 Create VPC Network

```bash
# Create VPC network
gcloud compute networks create $VPC_NETWORK_NAME --subnet-mode=auto
```

### 3.2 Create Service Account

```bash
# Create service account
gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
    --display-name="$APP_NAME Service Account"

# Grant necessary roles
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/storage.objectAdmin"
```

### 3.3 Set Up Secret Manager

```bash
# Create secrets
echo -n "$DB_PASSWORD" | gcloud secrets create db-password --data-file=-
echo -n "$JWT_SECRET" | gcloud secrets create jwt-secret --data-file=-
echo -n "$ENCRYPTION_KEY" | gcloud secrets create encryption-key --data-file=-

# Grant access to service account
gcloud secrets add-iam-policy-binding db-password \
    --member="serviceAccount:${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding jwt-secret \
    --member="serviceAccount:${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding encryption-key \
    --member="serviceAccount:${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

## 4. Set Up Storage and Database

### 4.1 Create Cloud Storage Bucket

```bash
# Create bucket
gsutil mb -l $REGION gs://$STORAGE_BUCKET_NAME

# Set permissions
gsutil iam ch serviceAccount:${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com:objectAdmin gs://$STORAGE_BUCKET_NAME
```

### 4.2 Set Up Cloud SQL for PostgreSQL

```bash
# Create Cloud SQL instance
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

# Create database
gcloud sql databases create $DB_NAME --instance=$DB_INSTANCE_NAME

# Create user
gcloud sql users create $DB_USER \
    --instance=$DB_INSTANCE_NAME \
    --password=$DB_PASSWORD

# Get the connection name
export DB_CONNECTION_NAME=$(gcloud sql instances describe $DB_INSTANCE_NAME --format='value(connectionName)')
echo "Database Connection Name: $DB_CONNECTION_NAME" >> deployment-config.txt
```

### 4.3 Set Up Memorystore for Redis

```bash
# Create Redis instance
gcloud redis instances create $REDIS_INSTANCE_NAME \
    --size=1 \
    --region=$REGION \
    --zone=$ZONE \
    --redis-version=redis_6_x \
    --network=$VPC_NETWORK_NAME

# Get the Redis IP address
export REDIS_IP=$(gcloud redis instances describe $REDIS_INSTANCE_NAME --region=$REGION --format='value(host)')
echo "Redis IP: $REDIS_IP" >> deployment-config.txt
```

## 5. Deploy Backend

### 5.1 Create Environment Configuration

```bash
# Create .env file for backend
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
```

### 5.2 Create Dockerfile

```bash
# Create Dockerfile for backend
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
```

### 5.3 Build and Push Docker Image

```bash
# Navigate to the API directory
cd api

# Build the Docker image
docker build -t gcr.io/$PROJECT_ID/$BACKEND_SERVICE_NAME .

# Push the image to Google Container Registry
docker push gcr.io/$PROJECT_ID/$BACKEND_SERVICE_NAME

# Return to the root directory
cd ..
```

### 5.4 Deploy to Cloud Run

```bash
# Deploy to Cloud Run
gcloud run deploy $BACKEND_SERVICE_NAME \
    --image gcr.io/$PROJECT_ID/$BACKEND_SERVICE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --add-cloudsql-instances $DB_CONNECTION_NAME \
    --service-account ${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com \
    --set-env-vars "DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@localhost/${DB_NAME}?host=/cloudsql/${DB_CONNECTION_NAME},REDIS_HOST=${REDIS_IP},REDIS_PORT=6379,JWT_SECRET=${JWT_SECRET},ENCRYPTION_KEY=${ENCRYPTION_KEY}"

# Get the backend URL
export BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE_NAME --region=$REGION --format='value(status.url)')
echo "Backend URL: $BACKEND_URL" >> deployment-config.txt
```

## 6. Deploy Frontend

### 6.1 Create Environment Configuration

```bash
# Create .env file for frontend
cat > app/.env.production << EOF
VITE_API_URL=${BACKEND_URL}
EOF
```

### 6.2 Build Frontend

```bash
# Navigate to the app directory
cd app

# Install dependencies
npm install

# Build the application
npm run build

# Return to the root directory
cd ..
```

### 6.3 Deploy to Firebase Hosting

```bash
# Login to Firebase
firebase login

# Initialize Firebase
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

# Deploy to Firebase Hosting
firebase deploy --only hosting --project $PROJECT_ID

# Get the frontend URL
export FRONTEND_URL=$(firebase hosting:info --project $PROJECT_ID | grep "Hosting URL" | cut -d' ' -f3)
echo "Frontend URL: $FRONTEND_URL" >> deployment-config.txt
```

## 7. Post-Deployment Steps

### 7.1 Run Database Migrations

```bash
# Navigate to the API directory
cd api

# Run Prisma migrations
npx prisma migrate deploy

# Seed the database
npx prisma db seed

# Return to the root directory
cd ..
```

### 7.2 Set Up Cloud Armor for Security (Optional)

```bash
# Create security policy
gcloud compute security-policies create ${APP_NAME}-policy \
    --description "Security policy for $APP_NAME"

# Add rules to block XSS attacks
gcloud compute security-policies rules create 1000 \
    --security-policy ${APP_NAME}-policy \
    --description "Block XSS attacks" \
    --expression "evaluatePreconfiguredExpr('xss-stable')" \
    --action "deny-403"

# Add rules to block SQL injection attacks
gcloud compute security-policies rules create 1001 \
    --security-policy ${APP_NAME}-policy \
    --description "Block SQL injection attacks" \
    --expression "evaluatePreconfiguredExpr('sqli-stable')" \
    --action "deny-403"
```

### 7.3 Set Up Monitoring and Alerts (Optional)

```bash
# Create a basic monitoring dashboard
gcloud monitoring dashboards create \
    --config-from-file=- << EOF
{
  "displayName": "${APP_NAME} Dashboard",
  "gridLayout": {
    "columns": "2",
    "widgets": [
      {
        "title": "Cloud Run - Request Count",
        "xyChart": {
          "dataSets": [
            {
              "timeSeriesQuery": {
                "timeSeriesFilter": {
                  "filter": "metric.type=\"run.googleapis.com/request_count\" resource.type=\"cloud_run_revision\" resource.label.\"service_name\"=\"${BACKEND_SERVICE_NAME}\"",
                  "aggregation": {
                    "alignmentPeriod": "60s",
                    "perSeriesAligner": "ALIGN_RATE"
                  }
                }
              }
            }
          ]
        }
      },
      {
        "title": "Cloud Run - Response Latencies",
        "xyChart": {
          "dataSets": [
            {
              "timeSeriesQuery": {
                "timeSeriesFilter": {
                  "filter": "metric.type=\"run.googleapis.com/request_latencies\" resource.type=\"cloud_run_revision\" resource.label.\"service_name\"=\"${BACKEND_SERVICE_NAME}\"",
                  "aggregation": {
                    "alignmentPeriod": "60s",
                    "perSeriesAligner": "ALIGN_PERCENTILE_99"
                  }
                }
              }
            }
          ]
        }
      }
    ]
  }
}
EOF
```

## 8. Verify Deployment

### 8.1 Test Backend API

```bash
# Test the backend API
curl -X GET "${BACKEND_URL}/api/health"
```

### 8.2 Test Frontend

Open the frontend URL in a web browser to verify that the application is working correctly.

## 9. Troubleshooting

### 9.1 Cloud SQL Connection Issues

If you encounter issues connecting to Cloud SQL:

1. Verify that the Cloud SQL instance is running:
   ```bash
   gcloud sql instances describe $DB_INSTANCE_NAME
   ```

2. Check that the service account has the necessary permissions:
   ```bash
   gcloud projects get-iam-policy $PROJECT_ID --flatten="bindings[].members" --format="table(bindings.role,bindings.members)" --filter="bindings.members:${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
   ```

3. Verify the connection string in the environment variables:
   ```bash
   gcloud run services describe $BACKEND_SERVICE_NAME --region=$REGION --format="value(spec.template.spec.containers[0].env)"
   ```

### 9.2 Redis Connection Issues

If you encounter issues connecting to Redis:

1. Verify that the Redis instance is running:
   ```bash
   gcloud redis instances describe $REDIS_INSTANCE_NAME --region=$REGION
   ```

2. Check the VPC network configuration:
   ```bash
   gcloud compute networks describe $VPC_NETWORK_NAME
   ```

### 9.3 Deployment Failures

If deployment fails:

1. Check the Cloud Build logs:
   ```bash
   gcloud builds list --filter="source.repoSource.repoName=$APP_NAME"
   ```

2. Verify that the Docker image builds correctly locally:
   ```bash
   cd api
   docker build -t $BACKEND_SERVICE_NAME .
   ```

3. Check the Cloud Run logs:
   ```bash
   gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=$BACKEND_SERVICE_NAME" --limit=10
   ```

## 10. Maintenance and Updates

### 10.1 Updating the Backend

To update the backend:

1. Make changes to the code
2. Build a new Docker image with a new tag:
   ```bash
   cd api
   docker build -t gcr.io/$PROJECT_ID/$BACKEND_SERVICE_NAME:v2 .
   docker push gcr.io/$PROJECT_ID/$BACKEND_SERVICE_NAME:v2
   ```

3. Deploy the new version:
   ```bash
   gcloud run deploy $BACKEND_SERVICE_NAME \
       --image gcr.io/$PROJECT_ID/$BACKEND_SERVICE_NAME:v2 \
       --platform managed \
       --region $REGION
   ```

### 10.2 Updating the Frontend

To update the frontend:

1. Make changes to the code
2. Build the application:
   ```bash
   cd app
   npm install
   npm run build
   ```

3. Deploy to Firebase Hosting:
   ```bash
   firebase deploy --only hosting --project $PROJECT_ID
   ```

### 10.3 Database Migrations

To run database migrations:

1. Create a new migration:
   ```bash
   cd api
   npx prisma migrate dev --name your_migration_name
   ```

2. Deploy the migration to production:
   ```bash
   npx prisma migrate deploy
   ```

## 11. Scaling Considerations

### 11.1 Cloud Run Scaling

Cloud Run automatically scales based on traffic. You can configure the minimum and maximum number of instances:

```bash
gcloud run services update $BACKEND_SERVICE_NAME \
    --min-instances=1 \
    --max-instances=10 \
    --region=$REGION
```

### 11.2 Database Scaling

To scale the database:

```bash
# Upgrade the machine type
gcloud sql instances patch $DB_INSTANCE_NAME \
    --tier=db-custom-2-4096

# Increase storage
gcloud sql instances patch $DB_INSTANCE_NAME \
    --storage-size=20
```

### 11.3 Redis Scaling

To scale Redis:

```bash
# Create a new Redis instance with larger capacity
gcloud redis instances create ${REDIS_INSTANCE_NAME}-new \
    --size=2 \
    --region=$REGION \
    --zone=$ZONE \
    --redis-version=redis_6_x \
    --network=$VPC_NETWORK_NAME

# Update the backend to use the new Redis instance
export NEW_REDIS_IP=$(gcloud redis instances describe ${REDIS_INSTANCE_NAME}-new --region=$REGION --format='value(host)')
gcloud run services update $BACKEND_SERVICE_NAME \
    --set-env-vars "REDIS_HOST=${NEW_REDIS_IP}" \
    --region=$REGION
```

## 12. Backup and Disaster Recovery

### 12.1 Database Backups

Cloud SQL automatically creates daily backups. You can also create on-demand backups:

```bash
# Create an on-demand backup
gcloud sql backups create --instance=$DB_INSTANCE_NAME

# List backups
gcloud sql backups list --instance=$DB_INSTANCE_NAME
```

### 12.2 Storage Backups

To back up Cloud Storage data:

```bash
# Create a backup bucket
gsutil mb -l $REGION gs://${STORAGE_BUCKET_NAME}-backup

# Copy data to the backup bucket
gsutil -m cp -r gs://$STORAGE_BUCKET_NAME/* gs://${STORAGE_BUCKET_NAME}-backup/
```

## Conclusion

You have successfully deployed the Bradán Accountants application to Google Cloud Platform. The application is now running in the europe-west1 (Ireland) region with a secure and scalable infrastructure.

For any issues or questions, please refer to the troubleshooting section or contact the development team.
