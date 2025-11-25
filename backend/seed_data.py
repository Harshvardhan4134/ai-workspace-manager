"""
Seed mock data for AI Workspace Manager
Run this script to populate Firestore with sample data
"""

import os
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timedelta

# Initialize Firebase
cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", 
    r"D:\AI Workspace manager\secrets\ai-workspace-manager-firebase-adminsdk-fbsvc-455ce1d44b.json")
if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

db = firestore.client()

# Mock employees
MOCK_EMPLOYEES = [
    {
        "id": "emp_alice",
        "name": "Alice Johnson",
        "email": "alice@company.com",
        "role": "developer",
        "skills": ["Python", "FastAPI", "React", "TypeScript"],
        "capacity_hours": 40,
        "assigned_hours": 24,
        "status": "active",
        "phone": "+1-555-0101",
        "bio": "Full-stack developer with 5 years of experience in web applications.",
        "avatar_url": None,
        "resume_url": None,
        "availability": "Available Mon-Fri 9AM-5PM"
    },
    {
        "id": "emp_bob",
        "name": "Bob Smith",
        "email": "bob@company.com",
        "role": "developer",
        "skills": ["JavaScript", "Node.js", "MongoDB", "Docker"],
        "capacity_hours": 40,
        "assigned_hours": 32,
        "status": "busy",
        "phone": "+1-555-0102",
        "bio": "Backend specialist focused on microservices and cloud architecture.",
        "avatar_url": None,
        "resume_url": None,
        "availability": "Available Mon-Thu 10AM-6PM"
    },
    {
        "id": "emp_carol",
        "name": "Carol Williams",
        "email": "carol@company.com",
        "role": "designer",
        "skills": ["Figma", "UI/UX", "CSS", "Tailwind"],
        "capacity_hours": 32,
        "assigned_hours": 16,
        "status": "active",
        "phone": "+1-555-0103",
        "bio": "UI/UX designer creating beautiful and intuitive interfaces.",
        "avatar_url": None,
        "resume_url": None,
        "availability": "Part-time: Mon, Wed, Fri"
    },
    {
        "id": "emp_david",
        "name": "David Chen",
        "email": "david@company.com",
        "role": "manager",
        "skills": ["Project Management", "Agile", "Scrum", "Team Leadership"],
        "capacity_hours": 40,
        "assigned_hours": 20,
        "status": "active",
        "phone": "+1-555-0104",
        "bio": "Technical project manager with expertise in Agile methodologies.",
        "avatar_url": None,
        "resume_url": None,
        "availability": "Always available for team support"
    },
    {
        "id": "emp_eva",
        "name": "Eva Martinez",
        "email": "eva@company.com",
        "role": "developer",
        "skills": ["Python", "Machine Learning", "TensorFlow", "Data Science"],
        "capacity_hours": 40,
        "assigned_hours": 36,
        "status": "busy",
        "phone": "+1-555-0105",
        "bio": "ML engineer specializing in NLP and computer vision solutions.",
        "avatar_url": None,
        "resume_url": None,
        "availability": "Available Mon-Fri, flexible hours"
    }
]

# Mock tasks
MOCK_TASKS = [
    {
        "id": "task_001",
        "title": "Implement User Authentication",
        "description": "Set up Firebase Auth with Google and Email providers",
        "tags": ["auth", "firebase", "security"],
        "attachments": [],
        "complexity": "medium",
        "priority": 4,
        "deadline": (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%d"),
        "flowchart_step": "Development",
        "customer_name": "Internal",
        "project_name": "AI Workspace Manager",
        "prd_url": "",
        "predicted_hours": 16,
        "assigned_to": "emp_alice",
        "created_by": "admin",
        "status": "in_progress",
        "watchers": ["emp_david"],
        "activity_log": [],
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    },
    {
        "id": "task_002",
        "title": "Design Dashboard UI",
        "description": "Create wireframes and high-fidelity mockups for the main dashboard",
        "tags": ["design", "ui", "dashboard"],
        "attachments": [],
        "complexity": "high",
        "priority": 5,
        "deadline": (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d"),
        "flowchart_step": "Design",
        "customer_name": "Internal",
        "project_name": "AI Workspace Manager",
        "prd_url": "",
        "predicted_hours": 24,
        "assigned_to": "emp_carol",
        "created_by": "emp_david",
        "status": "in_progress",
        "watchers": ["emp_alice", "emp_bob"],
        "activity_log": [],
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    },
    {
        "id": "task_003",
        "title": "Set up CI/CD Pipeline",
        "description": "Configure Cloud Build for automated testing and deployment",
        "tags": ["devops", "cicd", "automation"],
        "attachments": [],
        "complexity": "medium",
        "priority": 3,
        "deadline": (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d"),
        "flowchart_step": "Development",
        "customer_name": "Internal",
        "project_name": "AI Workspace Manager",
        "prd_url": "",
        "predicted_hours": 12,
        "assigned_to": "emp_bob",
        "created_by": "emp_david",
        "status": "open",
        "watchers": [],
        "activity_log": [],
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    },
    {
        "id": "task_004",
        "title": "Implement AI Prediction Engine",
        "description": "Integrate Gemini API for task assignment predictions",
        "tags": ["ai", "gemini", "ml"],
        "attachments": [],
        "complexity": "high",
        "priority": 5,
        "deadline": (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d"),
        "flowchart_step": "Development",
        "customer_name": "Internal",
        "project_name": "AI Workspace Manager",
        "prd_url": "",
        "predicted_hours": 20,
        "assigned_to": "emp_eva",
        "created_by": "emp_david",
        "status": "in_progress",
        "watchers": ["emp_alice"],
        "activity_log": [],
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    },
    {
        "id": "task_005",
        "title": "Write API Documentation",
        "description": "Document all REST endpoints with examples",
        "tags": ["docs", "api"],
        "attachments": [],
        "complexity": "low",
        "priority": 2,
        "deadline": (datetime.now() + timedelta(days=10)).strftime("%Y-%m-%d"),
        "flowchart_step": "Review",
        "customer_name": "Internal",
        "project_name": "AI Workspace Manager",
        "prd_url": "",
        "predicted_hours": 8,
        "assigned_to": None,
        "created_by": "emp_david",
        "status": "open",
        "watchers": [],
        "activity_log": [],
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
]

# Mock meetings
MOCK_MEETINGS = [
    {
        "id": "meet_001",
        "title": "Daily Standup",
        "description": "Quick sync on progress and blockers",
        "attendees": ["emp_alice", "emp_bob", "emp_carol", "emp_david", "emp_eva"],
        "date": (datetime.now() + timedelta(days=1, hours=9)).isoformat(),
        "duration_minutes": 15,
        "task_id": None,
        "created_by": "emp_david",
        "meet_url": "https://meet.google.com/abc-defg-hij"
    },
    {
        "id": "meet_002",
        "title": "AI Feature Review",
        "description": "Review AI prediction implementation and discuss improvements",
        "attendees": ["emp_eva", "emp_alice", "emp_david"],
        "date": (datetime.now() + timedelta(days=2, hours=14)).isoformat(),
        "duration_minutes": 60,
        "task_id": "task_004",
        "created_by": "emp_david",
        "meet_url": "https://meet.google.com/xyz-uvwx-stu"
    }
]

# Mock updates/notifications
MOCK_UPDATES = [
    {
        "id": "update_001",
        "user_id": "emp_alice",
        "user_name": "Alice Johnson",
        "priority": "high",
        "message": "Authentication module 80% complete. Testing Firebase integration.",
        "task_id": "task_001",
        "created_at": datetime.now().isoformat()
    },
    {
        "id": "update_002",
        "user_id": "emp_eva",
        "user_name": "Eva Martinez",
        "priority": "medium",
        "message": "AI predictions working! Need to fine-tune prompt engineering.",
        "task_id": "task_004",
        "created_at": datetime.now().isoformat()
    },
    {
        "id": "update_003",
        "user_id": "emp_david",
        "user_name": "David Chen",
        "priority": "low",
        "message": "Sprint planning scheduled for tomorrow. Please update your task estimates.",
        "task_id": None,
        "created_at": datetime.now().isoformat()
    }
]


def seed_collection(collection_name: str, data: list):
    """Seed a Firestore collection with data."""
    print(f"Seeding {collection_name}...")
    for item in data:
        doc_id = item.get("id")
        if doc_id:
            db.collection(collection_name).document(doc_id).set(item, merge=True)
        else:
            db.collection(collection_name).add(item)
    print(f"  ✅ Added {len(data)} documents to {collection_name}")


def main():
    print("🌱 Seeding mock data for AI Workspace Manager\n")
    
    seed_collection("users", MOCK_EMPLOYEES)
    seed_collection("tasks", MOCK_TASKS)
    seed_collection("meetings", MOCK_MEETINGS)
    seed_collection("updates", MOCK_UPDATES)
    
    print("\n✨ Mock data seeded successfully!")
    print("\nMock Users:")
    for emp in MOCK_EMPLOYEES:
        print(f"  - {emp['name']} ({emp['role']}) - {emp['email']}")


if __name__ == "__main__":
    main()

