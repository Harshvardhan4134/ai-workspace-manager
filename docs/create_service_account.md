# Create Service Account in bnbm-harsh-2025

## Step-by-Step Instructions

### Step 1: Navigate to Service Accounts

1. In the Google Cloud Console, make sure you're in project **bnbm-harsh-2025**
2. In the left sidebar, click **"Service Accounts"** (under "IAM & Admin")
   - Or go directly to: https://console.cloud.google.com/iam-admin/serviceaccounts?project=bnbm-harsh-2025

### Step 2: Create New Service Account

1. Click the **"+ CREATE SERVICE ACCOUNT"** button at the top
2. Fill in the details:
   - **Service account name:** `firebase-admin` (or any name you prefer)
   - **Service account ID:** Will auto-fill (e.g., `firebase-admin`)
   - **Description:** `Service account for AI Workspace Manager backend`
3. Click **"CREATE AND CONTINUE"**

### Step 3: Grant Roles

1. In the "Grant this service account access to project" section, click **"SELECT A ROLE"**
2. Add these roles one by one:
   - **Cloud Datastore User** (for Firestore access)
   - **Storage Object Admin** (for GCS bucket access)
   - **Firebase Admin SDK Administrator Service Agent** (if available)
3. After adding each role, click **"ADD ANOTHER ROLE"** to add the next one
4. Click **"CONTINUE"**

### Step 4: Skip Optional Steps

1. Click **"DONE"** (you can skip the optional steps for now)

### Step 5: Create and Download Key

1. You should now see your new service account in the list
2. Click on the service account email (e.g., `firebase-admin@bnbm-harsh-2025.iam.gserviceaccount.com`)
3. Go to the **"KEYS"** tab
4. Click **"ADD KEY"** → **"Create new key"**
5. Select **"JSON"** format
6. Click **"CREATE"**
7. The JSON file will download automatically

### Step 6: Update Your Backend Configuration

1. **Move the downloaded JSON file** to your project:
   - Save it as: `secrets/bnbm-harsh-2025-service-account.json`
   - (Or any name you prefer, but update the path accordingly)

2. **Update your backend `.env` file:**
   ```env
   GCP_PROJECT=bnbm-harsh-2025
   GCS_BUCKET=your-bucket-name
   ```

3. **Update the environment variable** when starting the backend:
   ```powershell
   $env:GOOGLE_APPLICATION_CREDENTIALS="D:\AI Workspace manager\secrets\bnbm-harsh-2025-service-account.json"
   ```

4. **Restart your backend**

### Alternative: Use the Existing Project

If you prefer to use the existing `ai-workspace-manager` project:

1. Update `backend/.env`:
   ```env
   GCP_PROJECT=ai-workspace-manager
   ```

2. Make sure the service account `firebase-adminsdk-fbsvc@ai-workspace-manager.iam.gserviceaccount.com` has the right roles in that project

3. Create Firestore database in `ai-workspace-manager` project instead

