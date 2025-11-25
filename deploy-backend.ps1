# Deploy Backend to Cloud Run
# Requires: gcloud CLI installed and authenticated

$PROJECT_ID = "ai-workspace-manager"
$REGION = "us-central1"
$SERVICE_NAME = "ai-workspace-backend"

Write-Host "🚀 Deploying Backend to Cloud Run..." -ForegroundColor Cyan

# Navigate to backend directory
Set-Location "$PSScriptRoot\backend"

# Build and deploy using Cloud Build
Write-Host "Building and deploying..." -ForegroundColor Yellow

gcloud builds submit --tag "gcr.io/$PROJECT_ID/$SERVICE_NAME" .

gcloud run deploy $SERVICE_NAME `
    --image "gcr.io/$PROJECT_ID/$SERVICE_NAME" `
    --region $REGION `
    --platform managed `
    --allow-unauthenticated `
    --memory 1Gi `
    --cpu 1 `
    --timeout 300 `
    --set-env-vars "GCP_PROJECT=$PROJECT_ID,AI_AGENT_BASE_URL=http://localhost:8081"

Write-Host "✅ Backend deployed!" -ForegroundColor Green
Write-Host "Get URL with: gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)'" -ForegroundColor Yellow

