# 🚀 AI Workspace Manager - Cloud Run Deployment Guide

## BNB Marathon 2025 - Full GCP Stack

This guide covers deploying the AI Workspace Manager to Google Cloud Run with all required GCP services for maximum hackathon points.

---

## 📊 Scoring Checklist

| Requirement | Points | Status |
|-------------|--------|--------|
| Cloud Run Deployment | +5 | ✅ Configured |
| GCP Database (Firestore) | +2 | ✅ Configured |
| Google AI (Gemini) | +5 | ✅ Integrated |
| Functional Demo | +5 | Ready to deploy |
| Blog Quality | +5 | [Blog outline ready](./medium_blog_outline.md) |
| Impact of Use Case | +5 | AI-powered task management |

**Total Possible: 27 points**

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Google Cloud Platform                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐     ┌──────────────────────────────────┐     │
│  │   Cloud Run  │     │         Cloud Run                 │     │
│  │   Frontend   │────▶│         Backend + AI Agent        │     │
│  │   (React)    │     │         (FastAPI + Gemini)        │     │
│  └──────────────┘     └──────────────────────────────────┘     │
│         │                           │                            │
│         │                           ├─────────────┐              │
│         │                           │             │              │
│         ▼                           ▼             ▼              │
│  ┌──────────────┐           ┌────────────┐ ┌───────────┐        │
│  │   Firebase   │           │  Firestore │ │    GCS    │        │
│  │     Auth     │           │  Database  │ │  Buckets  │        │
│  └──────────────┘           └────────────┘ └───────────┘        │
│                                     │                            │
│                                     ▼                            │
│                             ┌────────────┐                       │
│                             │  Gemini AI │                       │
│                             │    API     │                       │
│                             └────────────┘                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Prerequisites

1. **Google Cloud Account** with billing enabled
2. **gcloud CLI** installed and authenticated
3. **Docker** installed locally (for testing)
4. **Node.js 20+** and **Python 3.11+**

---

## 📝 Step-by-Step Deployment

### Step 1: Set Up GCP Project

```bash
# Set your project ID
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  firestore.googleapis.com \
  storage.googleapis.com \
  secretmanager.googleapis.com \
  aiplatform.googleapis.com
```

### Step 2: Create Firestore Database

```bash
# Create Firestore in Native mode
gcloud firestore databases create --location=asia-southeast1
```

### Step 3: Create GCS Bucket for Attachments

```bash
# Create bucket
gsutil mb -l asia-southeast1 gs://${PROJECT_ID}-attachments

# Set CORS for file uploads
cat > cors.json << EOF
[
  {
    "origin": ["*"],
    "method": ["GET", "PUT", "POST", "DELETE"],
    "responseHeader": ["Content-Type", "Authorization"],
    "maxAgeSeconds": 3600
  }
]
EOF
gsutil cors set cors.json gs://${PROJECT_ID}-attachments
```

### Step 4: Set Up Secrets

```bash
# Create Gemini API key secret
echo -n "YOUR_GEMINI_API_KEY" | \
  gcloud secrets create gemini-api-key --data-file=-

# Create Firebase API key secret (for frontend)
echo -n "YOUR_FIREBASE_API_KEY" | \
  gcloud secrets create firebase-api-key --data-file=-

# Grant Cloud Build access to secrets
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
gcloud secrets add-iam-policy-binding gemini-api-key \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
gcloud secrets add-iam-policy-binding firebase-api-key \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Step 5: Deploy with Cloud Build

```bash
# From project root directory
gcloud builds submit --config=cloudbuild.yaml
```

Or deploy manually:

```bash
# Build and push backend
cd backend
gcloud builds submit --tag gcr.io/${PROJECT_ID}/ai-workspace-api
gcloud run deploy ai-workspace-api \
  --image gcr.io/${PROJECT_ID}/ai-workspace-api \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --set-env-vars "GCP_PROJECT=${PROJECT_ID},GCS_BUCKET=${PROJECT_ID}-attachments" \
  --set-secrets "GEMINI_API_KEY=gemini-api-key:latest"

# Get backend URL
BACKEND_URL=$(gcloud run services describe ai-workspace-api \
  --region asia-southeast1 --format='value(status.url)')

# Build and push frontend
cd ../frontend
docker build \
  --build-arg VITE_API_BASE_URL=${BACKEND_URL} \
  --build-arg VITE_FIREBASE_PROJECT_ID=${PROJECT_ID} \
  -t gcr.io/${PROJECT_ID}/ai-workspace-app .
docker push gcr.io/${PROJECT_ID}/ai-workspace-app

gcloud run deploy ai-workspace-app \
  --image gcr.io/${PROJECT_ID}/ai-workspace-app \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --memory 256Mi
```

---

## 🔍 Verify Deployment

### Health Checks

```bash
# Backend health
curl $(gcloud run services describe ai-workspace-api \
  --region asia-southeast1 --format='value(status.url)')/health

# Expected: {"status":"ok"}
```

### Test AI Endpoint

```bash
# Test Gemini integration
curl -X POST $(gcloud run services describe ai-workspace-api \
  --region asia-southeast1 --format='value(status.url)')/agent/who-is-overloaded \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ID_TOKEN"
```

---

## 🎯 Demo URLs

After deployment, your services will be available at:

- **Frontend**: `https://ai-workspace-app-HASH-REGION.run.app`
- **Backend API**: `https://ai-workspace-api-HASH-REGION.run.app`
- **API Docs**: `https://ai-workspace-api-HASH-REGION.run.app/docs`

---

## 💡 Key Features for Judges

### 1. AI-Powered Task Assignment
- Uses **Gemini 1.5 Pro** for intelligent task routing
- Predicts hours, assigns team members, suggests deadlines
- Real-time workload balancing

### 2. GCP-Native Architecture
- **Firestore**: Real-time task updates with listeners
- **Cloud Storage**: Secure file attachments with signed URLs
- **Cloud Run**: Auto-scaling, pay-per-use

### 3. Dashboard Visualizations
- AI Predictions Panel with confidence scores
- Task Workflow Pipeline showing data flow
- Workload distribution charts
- Deadline forecasting

---

## 🐛 Troubleshooting

### Common Issues

1. **AI Agent Not Responding**
   ```bash
   # Check logs
   gcloud run services logs read ai-workspace-api --region asia-southeast1
   ```

2. **CORS Errors**
   - Ensure GCS CORS is configured
   - Check Cloud Run allows all origins

3. **Firestore Permission Denied**
   ```bash
   # Grant Cloud Run service account access
   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
     --role="roles/datastore.user"
   ```

---

## 📈 Cost Estimation

| Service | Free Tier | Estimated Cost |
|---------|-----------|----------------|
| Cloud Run | 2M requests/month | ~$0-5/month |
| Firestore | 50K reads/day | ~$0-2/month |
| Cloud Storage | 5GB | ~$0-1/month |
| Gemini API | Pay per token | ~$5-20/month |

**Total: ~$5-30/month** for demo usage

---

## 🏆 Submission Checklist

- [ ] Cloud Run services deployed and accessible
- [ ] Firestore database with sample data
- [ ] GCS bucket with CORS configured
- [ ] Gemini API integrated and working
- [ ] Demo video/screenshots captured
- [ ] Blog post written and published
- [ ] Repository README updated

Good luck with BNB Marathon 2025! 🎉

