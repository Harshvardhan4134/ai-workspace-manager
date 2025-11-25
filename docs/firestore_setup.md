# Firestore Setup Guide

## Fix 403 Permission Errors

If you're seeing `403 Missing or insufficient permissions`, follow these steps:

### Step 1: Verify Your Project ID

Check your `backend/.env` file and ensure `GCP_PROJECT` matches your actual Google Cloud project:

```env
GCP_PROJECT=bnbm-harsh-2025
```

**Important**: The project ID in `.env` must match the project where:
- Your Firestore database will be created
- Your service account has permissions

### Step 2: Create Firestore Database

1. **Open Google Cloud Console:**
   - Go to: https://console.cloud.google.com/datastore/setup?project=bnbm-harsh-2025
   - (Replace `bnbm-harsh-2025` with your actual project ID)

2. **Create Database:**
   - Click **"Create Database"**
   - Select **"Firestore in Native mode"**
   - Choose a **location** (e.g., `us-central`, `us-east1`)
   - Click **"Create"**

3. **Wait for creation** (takes 1-2 minutes)

### Step 3: Grant Service Account Permissions

Your service account needs these IAM roles:

1. **Go to IAM & Admin:**
   - https://console.cloud.google.com/iam-admin/iam?project=bnbm-harsh-2025

2. **Find your service account:**
   - Look for: `firebase-adminsdk-fbsvc@ai-workspace-manager.iam.gserviceaccount.com`
   - **OR** if using a different project, find the service account email from your JSON file

3. **Grant these roles:**
   - **Cloud Datastore User** (for Firestore read/write)
   - **Storage Object Admin** (for GCS bucket access)
   - **Firebase Admin SDK Administrator Service Agent** (if available)

4. **To add roles:**
   - Click the pencil icon (Edit) next to the service account
   - Click **"ADD ANOTHER ROLE"**
   - Search for and add: `Cloud Datastore User`
   - Click **"SAVE"**

### Step 4: Verify Service Account JSON

Ensure your service account JSON file matches your project:

1. **Check the JSON file:**
   - Open: `secrets/ai-workspace-manager-firebase-adminsdk-fbsvc-455ce1d44b.json`
   - Verify `project_id` matches your `.env` file

2. **If project IDs don't match:**
   - Either update `.env` to match the JSON file's project
   - OR download a new service account JSON from the correct project

### Step 5: Restart Backend

After making changes:

```powershell
# Stop the backend (Ctrl+C)
# Then restart:
cd "D:\AI Workspace manager\backend"
$env:GOOGLE_APPLICATION_CREDENTIALS="D:\AI Workspace manager\secrets\ai-workspace-manager-firebase-adminsdk-fbsvc-455ce1d44b.json"
uvicorn app.main:app --reload
```

### Step 6: Test

Try saving a profile again. The error should be resolved.

## Troubleshooting

### Still getting 403?

1. **Check project ID consistency:**
   - `.env` file: `GCP_PROJECT=...`
   - Service account JSON: `"project_id": "..."`
   - Google Cloud Console: Project selector (top bar)

2. **Verify database exists:**
   - Go to: https://console.cloud.google.com/firestore/databases?project=bnbm-harsh-2025
   - You should see a database listed

3. **Check service account permissions:**
   - Go to: https://console.cloud.google.com/iam-admin/iam?project=bnbm-harsh-2025
   - Find your service account and verify it has `Cloud Datastore User` role

4. **Wait a few minutes:**
   - IAM permission changes can take 1-2 minutes to propagate

### Project ID Mismatch?

If your service account is from `ai-workspace-manager` but you're using `bnbm-harsh-2025`:

**Option A: Use the service account's project**
```env
GCP_PROJECT=ai-workspace-manager
```

**Option B: Create a new service account in the correct project**
1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts?project=bnbm-harsh-2025
2. Create a new service account
3. Grant it `Cloud Datastore User` role
4. Download the JSON key
5. Update `GOOGLE_APPLICATION_CREDENTIALS` to point to the new file

