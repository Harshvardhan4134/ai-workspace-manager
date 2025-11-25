from __future__ import annotations

from typing import Any, Dict, List

import httpx

from app.config import get_settings
from app.models import AIAssignmentResult


class AIAgentService:
    """Handles outbound MCP/Gemini calls."""

    def __init__(self) -> None:
        self._settings = get_settings()
        self._agent_base_url = self._settings.ai_agent_base_url

    async def _post(self, path: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        try:
            # Increased timeout for AI operations (30 seconds default)
            timeout = httpx.Timeout(self._settings.ai_timeout_seconds if self._settings.ai_timeout_seconds > 10 else 30.0)
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(f"{self._agent_base_url}{path}", json=payload)
                response.raise_for_status()
                return response.json()
        except httpx.ConnectError:
            # Connection error - AI agent not running
            raise ValueError(
                f"AI agent not available at {self._agent_base_url}. "
                f"Please ensure the MCP agent is running or set AI_AGENT_BASE_URL in your .env file."
            )
        except httpx.HTTPError as e:
            # HTTP error - log and re-raise
            raise ValueError(f"AI agent error: {str(e)}")

    async def predict_assignment(
        self, task_payload: Dict[str, Any], team: List[Dict[str, Any]]
    ) -> AIAssignmentResult:
        prompt = {
            "task": task_payload,
            "team": team,
            "instructions": (
                "Return JSON with predicted_hours, best_member_id, priority, deadline (YYYY-MM-DD), "
                "flowchart_next_step, required_meeting, meeting_suggestion {attendees,duration,day}, reason."
            ),
        }
        result = await self._post("/assignment", prompt)
        return AIAssignmentResult(**result)

    async def summarize_chat(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        prompt = {
            "messages": messages[-10:],
            "instructions": "Summarize into 3 bullets + status line + recommended next action.",
        }
        result = await self._post("/summarize", prompt)
        return result

    async def overload_report(self, workloads: List[Dict[str, Any]]) -> Dict[str, Any]:
        prompt = {
            "workloads": workloads,
            "instructions": "List top 3 overloaded members + 2 fixes.",
        }
        result = await self._post("/overload", prompt)
        return result

    async def suggest_meeting(self, context: Dict[str, Any]) -> Dict[str, Any]:
        prompt = {
            "context": context,
            "instructions": "Recommend meeting with attendees, duration, day, and reason.",
        }
        result = await self._post("/meeting", prompt)
        return result

    async def flowchart_prediction(self, context: Dict[str, Any]) -> Dict[str, Any]:
        prompt = {
            "task": context,
            "instructions": "Predict next workflow step (Requirements, Design, Development, Testing, Review, Deployment) "
            "and list blockers + recommended action.",
        }
        result = await self._post("/flowchart", prompt)
        return result


