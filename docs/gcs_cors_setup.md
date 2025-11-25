# Configure CORS for Google Cloud Storage

## Problem
When uploading files directly to GCS from the browser, you get CORS errors because the bucket doesn't allow cross-origin requests.

## Solution: Configure CORS on the GCS Bucket

### Option 1: Using Google Cloud Console (Easiest)

1. **Go to Cloud Storage:**
   - Navigate to: https://console.cloud.google.com/storage/browser?project=ai-workspace-manager
   - Make sure you're in the `ai-workspace-manager` project

2. **Select your bucket:**
   - Click on the bucket: `ai-workspace-manager-files`

3. **Open CORS configuration:**
   - Click on the **"Configuration"** tab
   - Scroll down to **"Cross-origin resource sharing (CORS)"**
   - Click **"Edit CORS configuration"**

4. **Add CORS configuration:**
   - Click **"Add item"** or paste this JSON:
   ```json
   [
     {
       "origin": ["http://localhost:5173", "http://localhost:3000", "http://localhost:5174"],
       "method": ["GET", "PUT", "POST", "HEAD", "DELETE"],
       "responseHeader": ["Content-Type", "Content-Length", "x-goog-resumable"],
       "maxAgeSeconds": 3600
     }
   ]
   ```

5. **Save:**
   - Click **"Save"**

### Option 2: Using gsutil Command Line

1. **Create a CORS configuration file:**
   Create a file named `cors.json`:
   ```json
   [
     {
       "origin": ["http://localhost:5173", "http://localhost:3000", "http://localhost:5174"],
       "method": ["GET", "PUT", "POST", "HEAD", "DELETE"],
       "responseHeader": ["Content-Type", "Content-Length", "x-goog-resumable"],
       "maxAgeSeconds": 3600
     }
   ]
   ```

2. **Apply CORS configuration:**
   ```bash
   gsutil cors set cors.json gs://ai-workspace-manager-files
   ```

### Option 3: Using gcloud CLI

```bash
gcloud storage buckets update gs://ai-workspace-manager-files \
  --cors-file=cors.json
```

## For Production

When deploying to production, update the CORS configuration to include your production domain:

```json
[
  {
    "origin": [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://your-production-domain.com"
    ],
    "method": ["GET", "PUT", "POST", "HEAD", "DELETE"],
    "responseHeader": ["Content-Type", "Content-Length", "x-goog-resumable"],
    "maxAgeSeconds": 3600
  }
]
```

## Verify CORS is Working

After configuring CORS, try uploading a file again. The CORS error should be resolved.

## Troubleshooting

- **Still getting CORS errors?** Wait 1-2 minutes for changes to propagate
- **Different port?** Add your port to the `origin` array in the CORS config
- **Production domain?** Make sure to add your production URL to the `origin` array

