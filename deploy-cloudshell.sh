#!/bin/bash
# Run this in Google Cloud Shell: https://shell.cloud.google.com/?project=ai-workspace-manager

# Clone or upload your code first, then run:
cd backend

# Set project
gcloud config set project ai-workspace-manager

# Enable required APIs
gcloud services enable run.googleapis.com cloudbuild.googleapis.com containerregistry.googleapis.com aiplatform.googleapis.com

# Build and deploy to Cloud Run
gcloud run deploy ai-workspace-backend \
    --source . \
    --region us-central1 \
    --platform managed \
    --allow-unauthenticated \
    --memory 1Gi \
    --cpu 1 \
    --timeout 300 \
    --set-env-vars "GCP_PROJECT=ai-workspace-manager,AI_AGENT_BASE_URL=http://localhost:8081"

# Get the URL
echo "✅ Deployed! Your backend URL:"
gcloud run services describe ai-workspace-backend --region us-central1 --format 'value(status.url)'

