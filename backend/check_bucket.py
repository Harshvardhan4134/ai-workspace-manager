#!/usr/bin/env python3
"""Check if bucket exists and list all buckets."""

import os
from google.cloud import storage
from app.config import get_settings

def check_bucket():
    settings = get_settings()
    bucket_name = settings.gcs_bucket
    project_id = settings.project_id
    
    print(f"Project: {project_id}")
    print(f"Looking for bucket: {bucket_name}\n")
    
    try:
        client = storage.Client(project=project_id)
        
        # List all buckets
        print("Available buckets in this project:")
        buckets = list(client.list_buckets())
        if buckets:
            for bucket in buckets:
                marker = " ✅" if bucket.name == bucket_name else ""
                print(f"  - {bucket.name}{marker}")
        else:
            print("  (no buckets found)")
        
        # Check if our bucket exists
        print(f"\nChecking if '{bucket_name}' exists...")
        bucket = client.bucket(bucket_name)
        if bucket.exists():
            print(f"✅ Bucket '{bucket_name}' exists!")
            print(f"   Location: {bucket.location}")
            print(f"   Storage class: {bucket.storage_class}")
        else:
            print(f"❌ Bucket '{bucket_name}' does NOT exist!")
            print(f"\nYou may need to create it or check the bucket name in .env")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    check_bucket()

