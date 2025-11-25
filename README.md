# AI Workspace Manager

A Gemini-powered task management platform designed for ops teams. Think of it as a smarter Jira alternative with AI-driven task assignment, workload balancing, and predictive insights.

![AI Workspace Manager](https://img.shields.io/badge/Powered%20by-Gemini%20AI-blue)
![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688)
![Firebase](https://img.shields.io/badge/Auth-Firebase-FFCA28)

## ✨ Features

### 🤖 AI-Powered Intelligence
- **Smart Task Assignment** - Gemini AI analyzes team skills, capacity, and workload to suggest optimal task assignments
- **Time Predictions** - AI estimates task completion time based on complexity and historical data
- **Workflow Predictions** - Predicts next steps in your task workflow
- **Chat Summarization** - AI summarizes task discussions and highlights key decisions

### 📋 Task Management
- **Kanban Board** - Drag-and-drop task management across status columns
- **Priority System** - 5-level priority with visual indicators
- **Task Details** - Rich task drawer with descriptions, attachments, and activity logs
- **Status Tracking** - Open → In Progress → In Review → Completed (or Blocked)

### 👥 Team Management
- **Employee Dashboard** - View team capacity and workload at a glance
- **Skill Matching** - AI matches tasks to team members based on skills
- **Capacity Planning** - Track assigned vs available hours per team member

### 📊 Analytics Dashboard
- **Task Distribution** - Pie charts showing status breakdown
- **Workload Charts** - Bar charts displaying team capacity
- **Priority Updates** - Real-time activity feed
- **AI Predictions Panel** - Confidence-scored recommendations

### 🗓️ Calendar & Meetings
- **Meeting Scheduler** - Create and manage team meetings
- **Task-linked Meetings** - Associate meetings with specific tasks
- **Google Meet Integration** - Auto-generate meeting links

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- Firebase project (for authentication)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python start.py
```

API server runs at `http://localhost:8000`

## 🎭 Demo Mode (Mock Data)

**No backend or Firebase setup needed!** The app includes a mock data mode for quick demos:

1. In `frontend/src/mockData.ts`, ensure:
   ```typescript
   export const USE_MOCK_DATA = true;
   ```

2. Run the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open `http://localhost:5173` - you'll be auto-logged in with sample data!

### Mock Data Includes:
- 👤 5 team members (PM, Developers, Designer, DevOps, QA)
- 📋 7 sample tasks across different statuses
- 🗓️ 4 upcoming meetings
- 💬 Chat messages on tasks
- 🤖 Simulated AI predictions

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Frontend │────▶│  FastAPI Backend│────▶│  Gemini AI      │
│  (Vite + TS)    │     │  (Python)       │     │  (Google Cloud) │
│                 │     │                 │     │                 │
└────────┬────────┘     └────────┬────────┘     └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │
│  Firebase Auth  │     │  Firestore DB   │
│                 │     │                 │
└─────────────────┘     └─────────────────┘
```

## 📁 Project Structure

```
ai-workspace-manager/
├── frontend/               # React + TypeScript frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── context/        # Auth context
│   │   ├── api/            # API client
│   │   └── mockData.ts     # Mock data for demos
│   └── package.json
├── backend/                # FastAPI backend
│   ├── app/
│   │   ├── routers/        # API endpoints
│   │   ├── services/       # Business logic
│   │   └── models.py       # Data models
│   └── requirements.txt
└── docs/                   # Documentation
```

## 🔧 Configuration

### Environment Variables

**Frontend** (`.env`):
```env
VITE_API_BASE=http://localhost:8000
```

**Backend** (`.env`):
```env
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
GEMINI_API_KEY=your-gemini-api-key
```

## 🚢 Deployment

### Google Cloud Run

```bash
# Build and deploy backend
gcloud run deploy ai-workspace-backend \
  --source ./backend \
  --region us-central1

# Build and deploy frontend
cd frontend && npm run build
# Deploy dist/ to Firebase Hosting or Cloud Storage
```

See `docs/cloud_run_deployment.md` for detailed instructions.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite, TanStack Query |
| UI | Custom CSS, Recharts, FullCalendar |
| Backend | FastAPI, Python 3.10+ |
| Database | Google Firestore |
| Storage | Google Cloud Storage |
| Auth | Firebase Authentication |
| AI | Google Gemini API |
| Deployment | Google Cloud Run |

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | List all tasks |
| POST | `/tasks` | Create task (AI auto-assigns) |
| PATCH | `/tasks/{id}` | Update task |
| GET | `/users` | List team members |
| GET | `/users/me` | Get current user profile |
| GET | `/meetings` | List meetings |
| POST | `/agent/flowchart` | Get AI workflow prediction |
| POST | `/messages/{task_id}/summarize` | AI summarize chat |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this for your own projects!

---

Built with ❤️ using React, FastAPI, and Google Gemini AI

