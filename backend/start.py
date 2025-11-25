"""
Startup script for Cloud Run
Starts both the AI Agent server and the main FastAPI app
"""
import os
import subprocess
import time
import sys

def main():
    port = int(os.environ.get("PORT", 8080))
    
    # Set AI agent URL for internal communication
    os.environ["AI_AGENT_BASE_URL"] = "http://localhost:8081"
    
    # Start AI Agent in background on port 8081
    print("🚀 Starting AI Agent Server on port 8081...")
    sys.stdout.flush()
    
    agent_env = os.environ.copy()
    agent_env["PORT"] = "8081"
    agent_proc = subprocess.Popen(
        [sys.executable, "ai_agent_server.py"],
        env=agent_env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT
    )
    
    # Wait for AI agent to start
    time.sleep(3)
    
    # Check if agent started
    if agent_proc.poll() is not None:
        print("⚠️ AI Agent failed to start, continuing without it...")
    else:
        print("✅ AI Agent Server started")
    
    # Start main API on Cloud Run port
    print(f"🚀 Starting Main API Server on port {port}...")
    sys.stdout.flush()
    
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=port)

if __name__ == "__main__":
    main()

