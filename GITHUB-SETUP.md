# GitHub and Cloud Build Setup Instructions

1. Go to Cloud Build in GCP Console
   - Visit: https://console.cloud.google.com/cloud-build/triggers?project=clink-saas-app

2. Connect Repository
   - Click "Connect Repository"
   - Select "GitHub (Cloud Build GitHub App)"
   - Click "Continue"
   - Install Google Cloud Build app in your GitHub account if not already installed
   - Select the repository "Clink-SaaS"
   - Click "Connect"

3. Create Trigger
   - Click "Create Trigger"
   - Fill in the following details:
     * Name: main-deploy
     * Event: Push to a branch
     * Source:
       - Repository: Clink-SaaS
       - Branch: ^main$
     * Configuration: Cloud Build configuration file (yaml)
     * Cloud Build configuration file location: /cloudbuild.yaml
   - Click "Create"

4. Initial Deployment
   - After creating the trigger, you can start an initial build by:
     * Click on the trigger name "main-deploy"
     * Click "Run Trigger"
     * This will start the first deployment of your application

5. Verify Deployment
   - Once the build completes:
     * Go to Cloud Run to see your deployed services
     * You should see two services: "frontend" and "backend"
     * Click on the URLs to access your application

Note: Make sure all the required secrets are properly set in Secret Manager before triggering the build:
- DB_PASSWORD
- JWT_SECRET
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_REDIRECT_URI
- WEBHOOK_URL

You can update secret values using:
```bash
echo -n "your-actual-value" | gcloud secrets versions add SECRET_NAME --data-file=-
