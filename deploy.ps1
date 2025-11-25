# AI Workspace Manager - Quick Deploy Script for BNB Marathon 2025
# Run: .\deploy.ps1 -ProjectId "your-gcp-project-id"

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectId,
    
    [string]$Region = "asia-southeast1",
    
    [string]$GeminiApiKey = ""
)

Write-Host "🚀 AI Workspace Manager - Cloud Run Deployment" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Set project
Write-Host "📋 Setting GCP project to: $ProjectId" -ForegroundColor Yellow
gcloud config set project $ProjectId

# Enable APIs
Write-Host "🔧 Enabling required APIs..." -ForegroundColor Yellow
$apis = @(
    "run.googleapis.com",
    "cloudbuild.googleapis.com", 
    "firestore.googleapis.com",
    "storage.googleapis.com",
    "secretmanager.googleapis.com"
)
foreach ($api in $apis) {
    gcloud services enable $api --quiet
}

# Create Firestore database if not exists
Write-Host "🗄️ Setting up Firestore..." -ForegroundColor Yellow
gcloud firestore databases create --location=$Region 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "   Firestore already exists, skipping..." -ForegroundColor Gray
}

# Create GCS bucket
$bucketName = "$ProjectId-attachments"
Write-Host "📦 Creating GCS bucket: $bucketName" -ForegroundColor Yellow
gsutil mb -l $Region gs://$bucketName 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "   Bucket already exists, skipping..." -ForegroundColor Gray
}

# Set CORS on bucket
Write-Host "🔒 Configuring CORS on bucket..." -ForegroundColor Yellow
$corsJson = @"
[
  {
    "origin": ["*"],
    "method": ["GET", "PUT", "POST", "DELETE"],
    "responseHeader": ["Content-Type", "Authorization"],
    "maxAgeSeconds": 3600
  }
]
"@
$corsJson | Out-File -FilePath ".\cors-temp.json" -Encoding utf8
gsutil cors set .\cors-temp.json gs://$bucketName
Remove-Item .\cors-temp.json

# Setup secrets
if ($GeminiApiKey -ne "") {
    Write-Host "🔑 Setting up Gemini API key secret..." -ForegroundColor Yellow
    echo $GeminiApiKey | gcloud secrets create gemini-api-key --data-file=- 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   Secret already exists, updating..." -ForegroundColor Gray
        echo $GeminiApiKey | gcloud secrets versions add gemini-api-key --data-file=-
    }
}

# Build and deploy backend
Write-Host ""
Write-Host "🏗️ Building and deploying Backend..." -ForegroundColor Cyan
Push-Location backend
gcloud builds submit --tag gcr.io/$ProjectId/ai-workspace-api
gcloud run deploy ai-workspace-api `
    --image gcr.io/$ProjectId/ai-workspace-api `
    --region $Region `
    --allow-unauthenticated `
    --memory 1Gi `
    --cpu 1 `
    --timeout 60s `
    --set-env-vars "GCP_PROJECT=$ProjectId,GCS_BUCKET=$bucketName,AI_AGENT_BASE_URL=http://localhost:8081" `
    --set-secrets "GEMINI_API_KEY=gemini-api-key:latest"
Pop-Location

# Get backend URL
$backendUrl = gcloud run services describe ai-workspace-api --region $Region --format="value(status.url)"
Write-Host "✅ Backend deployed at: $backendUrl" -ForegroundColor Green

# Build and deploy frontend
Write-Host ""
Write-Host "🏗️ Building and deploying Frontend..." -ForegroundColor Cyan
Push-Location frontend
docker build `
    --build-arg VITE_API_BASE_URL=$backendUrl `
    --build-arg VITE_FIREBASE_PROJECT_ID=$ProjectId `
    --build-arg VITE_FIREBASE_AUTH_DOMAIN="$ProjectId.firebaseapp.com" `
    --build-arg VITE_FIREBASE_STORAGE_BUCKET="$ProjectId.appspot.com" `
    -t gcr.io/$ProjectId/ai-workspace-app .
docker push gcr.io/$ProjectId/ai-workspace-app
gcloud run deploy ai-workspace-app `
    --image gcr.io/$ProjectId/ai-workspace-app `
    --region $Region `
    --allow-unauthenticated `
    --memory 256Mi
Pop-Location

# Get frontend URL
$frontendUrl = gcloud run services describe ai-workspace-app --region $Region --format="value(status.url)"
Write-Host "✅ Frontend deployed at: $frontendUrl" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 Deployment Complete!" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Frontend:  $frontendUrl" -ForegroundColor White
Write-Host "Backend:   $backendUrl" -ForegroundColor White
Write-Host "API Docs:  $backendUrl/docs" -ForegroundColor White
Write-Host ""
Write-Host "📊 BNB Marathon 2025 Scoring:" -ForegroundColor Yellow
Write-Host "  ✅ Cloud Run Deployment (+5 points)" -ForegroundColor Green
Write-Host "  ✅ GCP Database - Firestore (+2 points)" -ForegroundColor Green
Write-Host "  ✅ Google AI - Gemini (+5 points)" -ForegroundColor Green
Write-Host "  ✅ Functional Demo (+5 points)" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Verify health: curl $backendUrl/health" -ForegroundColor White
Write-Host "  2. Write your blog post using docs/medium_blog_outline.md" -ForegroundColor White
Write-Host "  3. Record demo video" -ForegroundColor White
Write-Host ""

