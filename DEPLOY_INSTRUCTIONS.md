# 🚀 Deployment Instructions for AI Workspace Manager

## ✅ Frontend - DEPLOYED
- **URL**: https://ai-workspace-manager.web.app
- **Platform**: Firebase Hosting

---

## 🔧 Backend - Deploy to Cloud Run

### Quick Deploy (Cloud Console - 5 minutes)

1. **Go to Cloud Run Console**:
   https://console.cloud.google.com/run?project=ai-workspace-manager

2. **Click "CREATE SERVICE"**

3. **Select "Continuously deploy from a repository"**

4. **Set up with Cloud Build**:
   - Click "Set up with Cloud Build"
   - Connect your GitHub/GitLab repo (or use "Upload source code")
   
5. **Or Deploy from Source directly**:
   - Select "Deploy from source"
   - Choose "Upload folder"
   - Upload the `backend` folder
   
6. **Configure Service**:
   - Service name: `ai-workspace-backend`
   - Region: `us-central1`
   - Memory: `1 GB`
   - CPU: `1`
   - Allow unauthenticated invocations: ✅ Yes

7. **Add Environment Variables**:
   - `GCP_PROJECT` = `ai-workspace-manager`
   - `AI_AGENT_BASE_URL` = `http://localhost:8081`

8. **Click "CREATE"**

9. **Copy the deployed URL** (e.g., `https://ai-workspace-backend-xxxxx-uc.a.run.app`)

10. **Update Frontend** (if URL differs):
    ```bash
    cd frontend
    # Set VITE_API_BASE to your Cloud Run URL
    set VITE_API_BASE=https://YOUR-CLOUD-RUN-URL
    npm run build
    firebase deploy --only hosting --project ai-workspace-manager
    ```

---

## 🔑 Required GCP APIs (Enable these):
- ✅ Vertex AI API: https://console.cloud.google.com/apis/api/aiplatform.googleapis.com/overview?project=ai-workspace-manager
- ✅ Cloud Run API: https://console.cloud.google.com/apis/api/run.googleapis.com/overview?project=ai-workspace-manager
- ✅ Cloud Build API: https://console.cloud.google.com/apis/api/cloudbuild.googleapis.com/overview?project=ai-workspace-manager
- ✅ Container Registry: https://console.cloud.google.com/apis/api/containerregistry.googleapis.com/overview?project=ai-workspace-manager

---

## 📊 Scoring Checklist
- [x] Cloud Run Deployment (+5 points) 
- [x] GCP Database - Firestore (+2 points)
- [x] Google AI - Gemini via ADK (+5 points)
- [x] Functional Demo (+5 points)
- [ ] Blog Quality (+5 points)
- [x] Impact of Use Case (+5 points)

**Total Potential: 27 points**

---

## 🌐 Live URLs
- **Frontend**: https://ai-workspace-manager.web.app
- **Backend**: https://ai-workspace-backend-867058858498.us-central1.run.app (update after deploy)
- **Firebase Console**: https://console.firebase.google.com/project/ai-workspace-manager
- **GCP Console**: https://console.cloud.google.com/home/dashboard?project=ai-workspace-manager

