# CI/CD Setup Guide

This document outlines the CI/CD setup for the project using Google Cloud Build.

## Prerequisites

1. Google Cloud Project with the following APIs enabled:
   - Cloud Build API
   - Cloud Run API
   - Container Registry API
   - Secret Manager API

2. Required GCP IAM roles:
   - Cloud Build Service Account
   - Cloud Run Admin
   - Secret Manager Secret Accessor
   - Storage Admin (for artifact registry)

## Cloud Build Trigger Setup

1. Go to Cloud Build > Triggers in the Google Cloud Console

2. Create the following triggers:

### Main Branch Deployment Trigger
- Name: `prod-deploy`
- Event: Push to branch
- Source: Your repository
- Branch: `^main$`
- Configuration: Cloud Build configuration file
- Cloud Build configuration file location: `/cloudbuild.yaml`

### Development Branch Trigger
- Name: `dev-deploy`
- Event: Push to branch
- Source: Your repository
- Branch: `^develop$`
- Configuration: Cloud Build configuration file
- Cloud Build configuration file location: `/cloudbuild.yaml`

### Pull Request Trigger
- Name: `pr-validation`
- Event: Pull Request
- Source: Your repository
- Branch: `.*`
- Configuration: Cloud Build configuration file
- Cloud Build configuration file location: `/cloudbuild.yaml`

## Secret Manager Setup

The following secrets need to be created in Secret Manager:

1. `DB_PASSWORD` - PostgreSQL database password
2. `JWT_SECRET` - JWT signing secret
3. `GOOGLE_CLIENT_ID` - Google OAuth client ID
4. `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
5. `GOOGLE_REDIRECT_URI` - Google OAuth redirect URI
6. `WEBHOOK_URL` - Webhook URL for build notifications (e.g., Slack)

To create a secret:
```bash
gcloud secrets create SECRET_NAME --replication-policy="automatic"
echo -n "secret-value" | gcloud secrets versions add SECRET_NAME --data-file=-
```

## Branch Protection Rules

Set up the following branch protection rules in your repository:

### Main Branch Protection
- Require pull request reviews before merging
- Require status checks to pass before merging
  - Require Cloud Build status checks
- Include administrators in these restrictions
- Allow force pushes: No
- Allow deletions: No

### Develop Branch Protection
- Require pull request reviews before merging
- Require status checks to pass before merging
  - Require Cloud Build status checks
- Include administrators in these restrictions
- Allow force pushes: No
- Allow deletions: No

## Build Caching

The CI/CD pipeline uses Docker layer caching to speed up builds:
- Images are tagged with both the commit SHA and 'latest'
- BuildKit is enabled for better caching
- Previous images are pulled before building to utilize the cache

## Deployment Process

1. Changes are pushed to a feature branch
2. Pull request is created to develop branch
3. Cloud Build validates the PR
4. After PR approval and merge, develop branch trigger runs
5. After testing in develop, create PR to main
6. Main branch trigger deploys to production

## Build Notifications

Build status notifications are sent via webhook (e.g., to Slack) with:
- Build status (Success/Failure)
- Commit SHA
- Branch name
- Commit author

## Monitoring and Logging

- Build logs are available in Cloud Logging
- Build history is available in Cloud Build
- Cloud Run service metrics are available in Cloud Monitoring

## Rollback Process

To rollback to a previous version:

1. Find the desired version's commit SHA
2. Run:
```bash
gcloud run services update-traffic frontend --to-revisions=REVISION_SHA=100
gcloud run services update-traffic backend --to-revisions=REVISION_SHA=100
```

## Troubleshooting

Common issues and solutions:

1. Build Timeout
   - Check the build logs for steps taking too long
   - Increase the timeout in cloudbuild.yaml if needed

2. Cache Not Working
   - Ensure the artifact registry has the latest tags
   - Check if BuildKit is properly enabled

3. Deployment Failures
   - Check service account permissions
   - Verify secret availability and values
   - Check Cloud Run service logs

4. Secret Access Issues
   - Verify secret versions exist
   - Check Cloud Build service account permissions
   - Ensure secret names match in cloudbuild.yaml
