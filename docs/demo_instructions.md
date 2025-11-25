# AI Workspace Manager — Demo Script & Checklist

## Pre-demo Setup
1. Backend: `cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload`
2. Frontend: `cd frontend && npm install && npm run dev`
3. Ensure Firebase project credentials + Firestore indexes + GCS bucket exist.
4. Populate demo seed (`scripts/seed_demo.py`, upcoming) for employees/tasks.

## 60-Second Demo Flow
1. **Login** — Show Firebase Google Sign-In redirect, land on dashboard.
2. **Create Task** — Add title/description, upload PRD, hit “Auto Assign with AI”.
3. **AI Prediction** — Highlight predicted hours, assignee, deadline, flowchart step.
4. **Task Detail** — Open drawer, show attachments, send chat message.
5. **AI Summary** — Click “Summarize Conversation” → read result.
6. **Dashboard** — Show workload bars/pie, AI alerts.
7. **Calendar** — Create meeting using AI suggestion.
8. **Employees** — Open profiles page, show skills/capacity list.
9. **Closing** — Share Cloud Run URL + repo + Medium blog link.

## Judge Talking Points
- “Auto-assign reduces coordination overhead; AI also recommends meetings & next steps.”
- “Chat, attachments, flowchart view all live in the task for context.”
- “Built for Rentshare’s ops, deployable in 24h on Cloud Run.”

## QA Checklist
- ✅ Google Auth works
- ✅ Task creation + AI response <3s
- ✅ Attachments upload + preview
- ✅ Chat real-time updates
- ✅ Dashboard charts render
- ✅ Meeting creation stored
- ✅ AI overload endpoint returns suggestions

