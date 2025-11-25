# AI Workspace Manager - Backend API + AI Agent
# Optimized for Google Cloud Run with Google ADK

FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8080
ENV AI_AGENT_PORT=8081

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for layer caching
COPY requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app/ ./app/
COPY ai_agent_server.py ./

# Create startup script that runs both servers
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
# Set AI Agent URL for internal communication\n\
export AI_AGENT_BASE_URL="http://localhost:${AI_AGENT_PORT}"\n\
\n\
# Start AI Agent Server in background on port 8081\n\
echo "Starting AI Agent Server on port ${AI_AGENT_PORT}..."\n\
PORT=${AI_AGENT_PORT} python ai_agent_server.py &\n\
AI_AGENT_PID=$!\n\
\n\
# Wait for AI agent to be ready\n\
echo "Waiting for AI Agent to start..."\n\
sleep 3\n\
\n\
# Start main FastAPI server on Cloud Run port (8080)\n\
echo "Starting Main API Server on port ${PORT}..."\n\
uvicorn app.main:app --host 0.0.0.0 --port ${PORT}\n\
\n\
# Cleanup on exit\n\
trap "kill $AI_AGENT_PID 2>/dev/null" EXIT\n\
' > /app/start.sh && chmod +x /app/start.sh

# Expose port (Cloud Run uses PORT env var, default 8080)
EXPOSE 8080

# Run the startup script
CMD ["/bin/bash", "/app/start.sh"]
