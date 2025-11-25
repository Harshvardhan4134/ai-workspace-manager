"""
AI Agent Server using Google ADK (Agent Development Kit)
This server provides AI-powered task management features using Gemini via ADK.

For BNB Marathon 2025 - Full GCP Stack

Authentication: Uses Application Default Credentials (ADC) via service account
Set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON file path.
"""

import os
import json
import asyncio
from typing import Dict, Any, List
from datetime import datetime, timedelta

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Google ADK imports
try:
    from google import genai
    from google.genai import types
    ADK_AVAILABLE = True
except ImportError:
    ADK_AVAILABLE = False
    print("Warning: google-genai not available. Install with: pip install google-adk")

app = FastAPI(title="AI Agent Server (ADK)")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Google GenAI client via ADK using Application Default Credentials
client = None
AUTH_METHOD = "none"

if ADK_AVAILABLE:
    try:
        # Try to use Application Default Credentials (service account)
        # This uses GOOGLE_APPLICATION_CREDENTIALS environment variable
        client = genai.Client(vertexai=True, project=os.getenv("GCP_PROJECT", "ai-workspace-manager"), location="us-central1")
        AUTH_METHOD = "vertexai_adc"
        print("✅ Google ADK client initialized with Vertex AI + ADC")
    except Exception as e:
        print(f"Vertex AI init failed: {e}")
        # Fallback: try API key if available
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            try:
                client = genai.Client(api_key=api_key)
                AUTH_METHOD = "api_key"
                print("✅ Google ADK client initialized with API key")
            except Exception as e2:
                print(f"API key init also failed: {e2}")
        else:
            print("ℹ️  No API key set. Using ADC via GOOGLE_APPLICATION_CREDENTIALS")
else:
    print("Warning: google-genai package not installed")


class AssignmentRequest(BaseModel):
    task: Dict[str, Any]
    team: List[Dict[str, Any]]
    instructions: str


class SummarizeRequest(BaseModel):
    messages: List[Dict[str, Any]]
    instructions: str


class OverloadRequest(BaseModel):
    workloads: List[Dict[str, Any]]
    instructions: str


class MeetingRequest(BaseModel):
    context: Dict[str, Any]
    instructions: str


class FlowchartRequest(BaseModel):
    task: Dict[str, Any]
    instructions: str


async def call_gemini_adk(prompt: str, system_instruction: str = None) -> str:
    """Call Gemini using Google ADK client."""
    if not client:
        raise HTTPException(
            status_code=503, 
            detail="ADK client not configured. Set GEMINI_API_KEY environment variable."
        )
    
    try:
        # Use ADK's generate_content method
        config = types.GenerateContentConfig(
            temperature=0.7,
            max_output_tokens=2048,
        )
        
        if system_instruction:
            config.system_instruction = system_instruction
        
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config=config
        )
        
        return response.text
    except Exception as e:
        print(f"ADK Error: {e}")
        raise HTTPException(status_code=500, detail=f"ADK/Gemini error: {str(e)}")


def parse_json_response(text: str) -> Dict[str, Any]:
    """Extract JSON from Gemini response."""
    import re
    
    # Try to find JSON in the response
    json_match = re.search(r'\{.*\}', text, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group())
        except json.JSONDecodeError:
            pass
    
    # If no JSON found, return as text
    return {"raw_response": text}


@app.post("/assignment")
async def predict_assignment(request: AssignmentRequest):
    """Predict task assignment using ADK/Gemini AI."""
    team_summary = "\n".join([
        f"- {member.get('name', 'Unknown')} (ID: {member.get('id')}): {', '.join(member.get('skills', []))} "
        f"[Capacity: {member.get('capacity_hours', 0)}h, Assigned: {member.get('assigned_hours', 0)}h]"
        for member in request.team
    ])
    
    system_instruction = """You are an AI task assignment engine for a workspace management system.
Always respond with valid JSON only, no markdown formatting or explanation."""
    
    prompt = f"""Analyze this task and team to make an optimal assignment:

Task Details:
- Title: {request.task.get('title', 'N/A')}
- Description: {request.task.get('description', 'N/A')}
- Complexity: {request.task.get('complexity', 'medium')}
- Tags: {', '.join(request.task.get('tags', []))}
- Customer: {request.task.get('customer_name', 'N/A')}
- Project: {request.task.get('project_name', 'N/A')}

Team Members:
{team_summary}

{request.instructions}

Return a JSON object with these exact fields:
{{
  "predicted_hours": <float>,
  "best_member_id": "<string>",
  "priority": <int 1-5>,
  "deadline": "<YYYY-MM-DD>",
  "flowchart_next_step": "<Requirements|Design|Development|Testing|Review|Deployment>",
  "required_meeting": <boolean>,
  "meeting_suggestion": {{"attendees": ["<id>"], "duration": <minutes>, "day": "<YYYY-MM-DD>"}} or null,
  "reason": "<brief explanation>"
}}"""

    response_text = await call_gemini_adk(prompt, system_instruction)
    result = parse_json_response(response_text)
    
    # Ensure required fields exist with defaults
    if "best_member_id" not in result and request.team:
        result["best_member_id"] = request.team[0].get("id")
    if "predicted_hours" not in result:
        result["predicted_hours"] = 8.0
    if "priority" not in result:
        result["priority"] = 3
    if "deadline" not in result:
        result["deadline"] = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
    if "flowchart_next_step" not in result:
        result["flowchart_next_step"] = "Development"
    if "required_meeting" not in result:
        result["required_meeting"] = False
    if "reason" not in result:
        result["reason"] = "AI assignment based on team skills and workload"
    
    return result


@app.post("/summarize")
async def summarize_chat(request: SummarizeRequest):
    """Summarize chat messages using ADK/Gemini."""
    messages_text = "\n".join([
        f"[{msg.get('sender_id', 'Unknown')}]: {msg.get('text', '')}"
        for msg in request.messages
    ])
    
    system_instruction = "You are a chat summarizer. Always respond with valid JSON only."
    
    prompt = f"""Summarize this conversation:

{messages_text}

{request.instructions}

Return JSON:
{{
  "bullets": ["<point 1>", "<point 2>", "<point 3>"],
  "status": "<current status>",
  "next_step": "<recommended action>"
}}"""

    response_text = await call_gemini_adk(prompt, system_instruction)
    result = parse_json_response(response_text)
    
    if "bullets" not in result:
        result["bullets"] = ["Summary not available"]
    if "status" not in result:
        result["status"] = "In progress"
    if "next_step" not in result:
        result["next_step"] = "Continue execution"
    
    return result


@app.post("/overload")
async def overload_report(request: OverloadRequest):
    """Generate overload report using ADK/Gemini."""
    workloads_text = "\n".join([
        f"- {w.get('name', 'Unknown')}: {w.get('utilization', 0) * 100:.0f}% utilization"
        for w in request.workloads
    ])
    
    system_instruction = "You are a workload analyst. Always respond with valid JSON only."
    
    prompt = f"""Analyze team workload and identify overloaded members:

{workloads_text}

{request.instructions}

Return JSON:
{{
  "overloaded": [{{"name": "<name>", "utilization": <float 0-1>}}],
  "suggestions": ["<fix 1>", "<fix 2>"]
}}"""

    response_text = await call_gemini_adk(prompt, system_instruction)
    result = parse_json_response(response_text)
    
    if "overloaded" not in result:
        sorted_load = sorted(request.workloads, key=lambda x: x.get("utilization", 0), reverse=True)
        result["overloaded"] = sorted_load[:3]
    if "suggestions" not in result:
        result["suggestions"] = ["Reassign tasks to balance workload", "Consider extending deadlines"]
    
    return result


@app.post("/meeting")
async def suggest_meeting(request: MeetingRequest):
    """Suggest a meeting using ADK/Gemini."""
    system_instruction = "You are a meeting scheduler AI. Always respond with valid JSON only."
    
    prompt = f"""Based on this context, suggest a meeting:

{json.dumps(request.context, indent=2)}

{request.instructions}

Return JSON:
{{
  "attendees": ["<member_id>"],
  "duration": <minutes>,
  "day": "<YYYY-MM-DD>",
  "reason": "<why this meeting is needed>"
}}"""

    response_text = await call_gemini_adk(prompt, system_instruction)
    result = parse_json_response(response_text)
    
    if "duration" not in result:
        result["duration"] = 30
    if "day" not in result:
        result["day"] = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    if "reason" not in result:
        result["reason"] = "Team sync recommended"
    
    return result


@app.post("/flowchart")
async def flowchart_prediction(request: FlowchartRequest):
    """Predict next flowchart step using ADK/Gemini."""
    system_instruction = "You are a workflow prediction AI. Always respond with valid JSON only."
    
    prompt = f"""Analyze this task and predict the next workflow step:

{json.dumps(request.task, indent=2)}

{request.instructions}

Return JSON:
{{
  "flowchart_next_step": "<Requirements|Design|Development|Testing|Review|Deployment>",
  "blockers": ["<blocker 1>"],
  "recommended_action": "<what to do next>"
}}"""

    response_text = await call_gemini_adk(prompt, system_instruction)
    result = parse_json_response(response_text)
    
    if "flowchart_next_step" not in result:
        result["flowchart_next_step"] = "Development"
    if "blockers" not in result:
        result["blockers"] = []
    if "recommended_action" not in result:
        result["recommended_action"] = "Continue with current step"
    
    return result


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {
        "status": "ok",
        "adk_available": ADK_AVAILABLE,
        "client_configured": client is not None,
        "auth_method": AUTH_METHOD,
        "model": "gemini-2.0-flash",
        "framework": "Google ADK",
        "gcp_project": os.getenv("GCP_PROJECT", "not_set")
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8081))
    print(f"🚀 Starting AI Agent Server (Google ADK) on port {port}")
    print(f"   ADK Available: {ADK_AVAILABLE}")
    print(f"   Client Configured: {client is not None}")
    print(f"   Auth Method: {AUTH_METHOD}")
    print(f"   GCP Project: {os.getenv('GCP_PROJECT', 'not_set')}")
    if AUTH_METHOD == "none":
        print("⚠️  Set GOOGLE_APPLICATION_CREDENTIALS for service account auth")
    uvicorn.run(app, host="0.0.0.0", port=port)
