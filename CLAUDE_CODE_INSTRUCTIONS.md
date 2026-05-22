# 🤖 INSTRUCTIONS FOR CLAUDE CODE
## Read this file first before doing anything

---

## What You Are Working On

You are helping build **MindBridge** — a full-stack student mental health platform that is also a university final exam project for SEN3244 Software Architecture at ICT University of Cameroon.

## CRITICAL: Read These Files First

Before writing any code, read these files in this order:
1. `MASTER_CONTEXT.md` — full project overview, tech stack, decisions made
2. `08_Architecture/Architecture_Notes.md` — architecture decisions, folder structure
3. `09_Team_Docs/Team_Reference.md` — team roles, build order, environment setup

## What Has Already Been Done

### Design (Figma)
- 25 pages designed ✅
- 37 more pages have prompts written but not yet designed
- Design system: Dark mode, #0D0F14 background, #00C9A7 teal accent

### Documents Created
- SEN3244 Execution Guide (exam requirements and 8-week plan)
- MindBridge Project Document (full feature description)
- Software Requirements Specification (46 FRs, 24 NFRs, API spec)
- Technology Stack Document (every tool explained)
- UX Navigation Flow Document (every page navigation path)

### Code
- NOTHING built yet — starting from zero

---

## What To Build Next

**Step 1: FastAPI Backend Scaffold**

Generate ALL of these files:

### Folder Structure
```
mindbridge-backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── database.py
│   ├── config.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── mood.py
│   │   ├── journal.py
│   │   ├── forum.py
│   │   ├── crisis.py
│   │   └── resource.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── mood.py
│   │   ├── journal.py
│   │   ├── forum.py
│   │   ├── crisis.py
│   │   └── resource.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── mood.py
│   │   ├── journal.py
│   │   ├── forum.py
│   │   ├── crisis.py
│   │   ├── resources.py
│   │   └── ai.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── mood_service.py
│   │   ├── journal_service.py
│   │   ├── forum_service.py
│   │   ├── crisis_service.py
│   │   ├── resource_service.py
│   │   └── ai_service.py
│   └── middleware/
│       ├── __init__.py
│       ├── auth.py
│       └── roles.py
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_mood.py
│   ├── test_journal.py
│   ├── test_forum.py
│   ├── test_crisis.py
│   └── test_resources.py
├── alembic/
│   └── versions/
├── k8s/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── pvc.yaml
│   └── hpa.yaml
├── ansible/
│   ├── inventory/
│   │   └── hosts.ini
│   └── playbooks/
│       ├── install_dependencies.yml
│       └── deploy_app.yml
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── requirements.txt
├── Jenkinsfile
├── alembic.ini
└── README.md
```

---

## Tech Stack (DO NOT CHANGE)

- **Python 3.11** + **FastAPI** — backend
- **PostgreSQL 15** — database
- **SQLAlchemy 2.0** — ORM
- **Pydantic v2** — validation
- **Uvicorn** — ASGI server
- **python-jose** — JWT
- **passlib[bcrypt]** — password hashing
- **Alembic** — migrations
- **PyTest + coverage.py** — testing (min 80% coverage)
- **Docker + Docker Compose** — containerization
- **Kubernetes** — orchestration
- **Jenkins** — CI/CD
- **Prometheus + Grafana** — monitoring
- **Ansible** — IaC

---

## Database Models (Exact Schema)

### User
```python
id: UUID (PK, auto)
name: String(100), not null
email: String, unique, not null
password_hash: String, not null
role: Enum('student', 'admin'), default='student'
university: String(200), nullable
year_of_study: String(50), nullable
created_at: DateTime, auto
```

### MoodLog
```python
id: UUID (PK, auto)
anon_token: String, not null  # NEVER store user_id here
mood_score: Integer, 1-5, not null
energy_level: Integer, 1-5, not null
note: Text, nullable
date: Date, not null
# Unique constraint: (anon_token, date) — one per day per user
```

### JournalEntry
```python
id: UUID (PK, auto)
user_id: UUID, FK → users.id, not null
title: String(200), not null
body: Text, not null
created_at: DateTime, auto
updated_at: DateTime, auto
```

### ForumPost
```python
id: UUID (PK, auto)
anon_name: String(100), auto-generated  # e.g. "Blue Sparrow"
body: Text, not null
category: String(100), nullable
created_at: DateTime, auto
is_deleted: Boolean, default=False
```

### ForumReply
```python
id: UUID (PK, auto)
post_id: UUID, FK → forum_posts.id
anon_name: String(100), auto-generated
body: Text, not null
created_at: DateTime, auto
```

### CrisisFlag
```python
id: UUID (PK, auto)
severity: Enum('low', 'medium', 'high'), not null
message: Text, nullable
resolved: Boolean, default=False
resolution_note: Text, nullable
created_at: DateTime, auto
```

### Resource
```python
id: UUID (PK, auto)
title: String(200), not null
category: Enum('article', 'breathing', 'coping', 'hotline'), not null
description: Text, nullable
url: String(500), nullable
created_by: UUID, FK → users.id
created_at: DateTime, auto
```

---

## API Endpoints Summary

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| POST | /auth/register | No | - |
| POST | /auth/login | No | - |
| GET | /auth/me | Yes | Any |
| PUT | /auth/me | Yes | Any |
| POST | /mood/checkin | Yes | Student |
| GET | /mood/history | Yes | Student |
| GET | /mood/trends | Yes | Admin |
| POST | /journal/entry | Yes | Student |
| GET | /journal/entries | Yes | Student |
| DELETE | /journal/entry/{id} | Yes | Student |
| GET | /forum/posts | Yes | Any |
| POST | /forum/post | Yes | Student |
| POST | /forum/post/{id}/reply | Yes | Student |
| DELETE | /forum/post/{id} | Yes | Admin |
| POST | /crisis/flag | Yes | Student |
| GET | /crisis/alerts | Yes | Admin |
| PUT | /crisis/alerts/{id}/resolve | Yes | Admin |
| GET | /resources | Yes | Any |
| POST | /resources | Yes | Admin |
| DELETE | /resources/{id} | Yes | Admin |
| POST | /ai/chat | Yes | Student |

---

## Privacy Rules (NEVER BREAK)

1. `MoodLog.anon_token` is a hashed version of user_id — never store raw user_id in mood logs
2. Journal entries — service layer must verify `entry.user_id == current_user.id` before returning
3. Forum posts — use auto-generated animal names, never link to user account
4. Crisis flags — no user identity stored unless they include it in the message
5. `/mood/trends` — only returns aggregated statistics, never individual entries

---

## Environment Variables (.env.example)

```
DATABASE_URL=postgresql://mindbridge_user:mindbridge_pass@db:5432/mindbridge_db
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
AI_API_KEY=your-api-key-here
AI_MODEL=claude-sonnet-4-20250514
ENVIRONMENT=development
```

---

## After Scaffold, Build In This Order

1. Auth (register, login, JWT middleware, role checks)
2. Mood Check-in (service, routes, anon_token generation)
3. Journal (CRUD, ownership verification)
4. Forum (anonymous posting, replies)
5. Crisis Flag (submission, admin retrieval)
6. Resources (CRUD, admin-only write)
7. AI Companion (Claude/OpenAI API integration)
8. Tests for all of the above (min 80% coverage)
9. Docker + docker-compose
10. Kubernetes YAMLs
11. Jenkinsfile
12. Ansible playbooks
13. Prometheus + Grafana setup

---

## Important Notes

- Use `--legacy-peer-deps` for npm installs (Vite 8 peer dependency conflicts)
- Team is on Windows with PowerShell and Command Prompt
- Python version: 3.11
- Always use `pip install --break-system-packages` in Docker
- FastAPI auto-generates Swagger at `/docs` — this satisfies Section 10 API documentation requirement
- Run `alembic upgrade head` to apply migrations
- Test with `pytest --cov=app --cov-report=html` — must show >= 80%
