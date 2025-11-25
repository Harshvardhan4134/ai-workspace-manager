#!/usr/bin/env python3
"""
Script to configure CORS on Google Cloud Storage bucket.
Run this from the backend directory.
"""

import os
import json
from google.cloud import storage
from app.config import get_settings

def setup_cors():
    settings = get_settings()
    bucket_name = settings.gcs_bucket
    project_id = settings.project_id
    
    print(f"Configuring CORS for bucket: {bucket_name}")
    print(f"Project: {project_id}")
    
    # CORS configuration
    cors_config = [
        {
            "origin": [
                "http://localhost:5173",
                "http://localhost:3000",
                "http://localhost:5174",
                "http://127.0.0.1:5173",
            ],
            "method": ["GET", "PUT", "POST", "HEAD", "DELETE"],
            "responseHeader": [
                "Content-Type",
                "Content-Length",
                "x-goog-resumable",
                "Access-Control-Allow-Origin",
            ],
            "maxAgeSeconds": 3600,
        }
    ]
    
    try:
        # Initialize the storage client
        client = storage.Client(project=project_id)
        bucket = client.bucket(bucket_name)
        
        # Set CORS configuration
        bucket.cors = cors_config
        bucket.patch()
        
        print("✅ CORS configuration applied successfully!")
        print(f"\nCORS configuration:")
        print(json.dumps(cors_config, indent=2))
        print("\nYou can now upload files from your frontend.")
        
    except Exception as e:
        print(f"❌ Error configuring CORS: {e}")
        print("\nMake sure:")
        print("1. GOOGLE_APPLICATION_CREDENTIALS environment variable is set")
        print("2. The service account has 'Storage Admin' or 'Storage Object Admin' role")
        print("3. The bucket exists and is accessible")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(setup_cors())

