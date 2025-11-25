import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AI Workspace Manager API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check - no auth required
@app.get("/health")
def health():
    return {"status": "ok", "env": os.getenv("GCP_PROJECT", "not_set")}

# Import routers after basic app setup
try:
    from app.routers import tasks, messages, attachments, agent, meetings, users, updates
    app.include_router(tasks.router)
    app.include_router(messages.router)
    app.include_router(attachments.router)
    app.include_router(agent.router)
    app.include_router(meetings.router)
    app.include_router(users.router)
    app.include_router(updates.router)
    print("✅ All routers loaded successfully")
except Exception as e:
    print(f"⚠️ Router import error: {e}")
    # App will still run with just /health endpoint
