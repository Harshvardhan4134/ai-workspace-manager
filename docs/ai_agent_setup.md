# AI Agent Setup Guide

The AI Agent Server acts as a bridge between your FastAPI backend and Google's Gemini AI. It handles all AI-powered features like task assignment, chat summarization, and workload analysis.

## Quick Start

### 1. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key

### 2. Install Dependencies

```bash
cd backend
pip install -r requirements_ai_agent.txt
```

Or install directly:
```bash
pip install google-generativeai
```

### 3. Start the AI Agent Server

**Option A: Using environment variable**
```bash
# Windows PowerShell
$env:GEMINI_API_KEY="your-api-key-here"
python ai_agent_server.py

# Windows CMD
set GEMINI_API_KEY=your-api-key-here
python ai_agent_server.py

# Linux/Mac
export GEMINI_API_KEY=your-api-key-here
python ai_agent_server.py
```

**Option B: Create a `.env` file in the backend directory**
```env
GEMINI_API_KEY=your-api-key-here
PORT=8081
```

Then run:
```bash
python ai_agent_server.py
```

The server will start on `http://localhost:8081` by default.

### 4. Verify It's Working

1. Check health endpoint:
   ```bash
   curl http://localhost:8081/health
   ```

2. You should see:
   ```json
   {
     "status": "ok",
     "gemini_configured": true,
     "gemini_available": true
   }
   ```

### 5. Configure Backend

The backend is already configured to use `http://localhost:8081` by default. If you need to change it, update `backend/.env`:

```env
AI_AGENT_BASE_URL=http://localhost:8081
AI_TIMEOUT_SECONDS=30
```

## Running Both Servers

You need to run both servers simultaneously:

**Terminal 1 - AI Agent Server:**
```bash
cd backend
$env:GEMINI_API_KEY="your-api-key-here"
python ai_agent_server.py
```

**Terminal 2 - FastAPI Backend:**
```bash
cd backend
$env:GOOGLE_APPLICATION_CREDENTIALS="D:\AI Workspace manager\secrets\ai-workspace-manager-firebase-adminsdk-fbsvc-455ce1d44b.json"
uvicorn app.main:app --reload
```

## Features

The AI Agent Server provides these endpoints:

- **POST /assignment** - Predicts task assignment, hours, priority, deadline
- **POST /summarize** - Summarizes chat conversations
- **POST /overload** - Analyzes team workload and suggests fixes
- **POST /meeting** - Suggests meetings based on context
- **POST /flowchart** - Predicts next workflow step
- **GET /health** - Health check

## Troubleshooting

### "Gemini API not configured"
- Make sure `GEMINI_API_KEY` environment variable is set
- Restart the AI agent server after setting the key

### "AI agent not available"
- Check that the AI agent server is running on port 8081
- Verify `AI_AGENT_BASE_URL` in `backend/.env` matches the server URL
- Check firewall settings if using a different host

### Connection refused errors
- Ensure the AI agent server is running before starting the FastAPI backend
- Check that port 8081 is not already in use

### Timeout errors
- Increase `AI_TIMEOUT_SECONDS` in `backend/.env` (default: 30 seconds)
- Check your internet connection (Gemini API requires internet)

## Production Deployment

For production, you can:

1. **Deploy AI Agent Server to Cloud Run:**
   ```bash
   gcloud run deploy ai-agent-server \
     --source . \
     --platform managed \
     --region us-central1 \
     --set-env-vars GEMINI_API_KEY=your-key \
     --port 8081
   ```

2. **Update backend `.env`:**
   ```env
   AI_AGENT_BASE_URL=https://ai-agent-server-xxxxx.run.app
   ```

3. **Or use environment variables in Cloud Run:**
   ```bash
   gcloud run services update your-backend-service \
     --set-env-vars AI_AGENT_BASE_URL=https://ai-agent-server-xxxxx.run.app
   ```

## Cost Considerations

- Gemini API has a free tier with generous limits
- Check [Google AI Studio pricing](https://ai.google.dev/pricing) for details
- The AI agent server only calls Gemini when tasks are created or AI features are used

