# MindBridge — Student Wellness Platform

> **A Privacy-First Campus Mental Health Platform**  
> SEN3244 — Software Architecture | Spring 2026 | ICT University of Cameroon  
> Instructor: Engr. TEKOH PALMA

[![Tests](https://img.shields.io/badge/tests-65%20passed-brightgreen)]()
[![Coverage](https://img.shields.io/badge/coverage-81.84%25-brightgreen)]()
[![Python](https://img.shields.io/badge/python-3.11-blue)]()
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-green)]()
[![React](https://img.shields.io/badge/React-18-61DAFB)]()
[![K8s](https://img.shields.io/badge/kubernetes-minikube-326CE5)]()

---

## What is MindBridge?

MindBridge is a full-stack campus mental health platform built for students at African universities where institutional counseling support is often limited. Students can track their mood anonymously, write private journal entries, support each other in an anonymous forum, access wellness resources, flag crises, and chat with an AI wellness companion.

**Core design principle:** No admin can ever identify which student submitted what — enforced at the data layer, not just the API.

---

## Features

| Feature | Description | Privacy |
|---------|-------------|---------|
| Mood Check-in | Daily 1–5 mood + energy score with optional note | `anon_token` only — never `user_id` |
| Private Journal | Create, read, update, delete personal entries | Admin access structurally blocked |
| Anonymous Forum | Post and reply using auto-generated animal names | `user_id` never in API responses |
| Crisis Flagging | Low/Medium/High severity alerts for counselors | No identity column in DB |
| Resource Library | Articles, hotlines, coping exercises | Admin-managed, all users read |
| MindBot AI Chat | 24/7 AI companion powered by Groq (Llama 3.3-70b) | Conversation not stored server-side |
| Profile | Update name, university, avatar | Standard auth |
| Admin Dashboard | Mood trends, crisis alerts, forum moderation | Aggregate data only |

---

## Architecture

Hybrid architecture combining four patterns:

- **N-Tier Layered** — 5 strict layers (primary pattern)
- **Client-Server** — React SPA ↔ FastAPI over REST/HTTP
- **Service-Oriented (SOA)** — independent containerized services (API, DB, Prometheus, Grafana)
- **Pipeline** — Jenkins 9-stage CI/CD

```
┌──────────────────────────────────────────────────────────┐
│  Layer 1 — Presentation: React 18 + TypeScript SPA       │
├──────────────────────────────────────────────────────────┤
│  Layer 2 — API/Routes: FastAPI + JWT + Rate Limiting     │
├──────────────────────────────────────────────────────────┤
│  Layer 3 — Business Logic: Services per domain module    │
├──────────────────────────────────────────────────────────┤
│  Layer 4 — Data Access: SQLAlchemy 2.0 ORM               │
├──────────────────────────────────────────────────────────┤
│  Layer 5 — Database: PostgreSQL 15                       │
└──────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend Framework | React | 18.x |
| Frontend Language | TypeScript | 5.x |
| Frontend Styling | Tailwind CSS | 3.x |
| Frontend Icons | Lucide React | latest |
| Frontend Build | Vite | 5.x |
| Backend Language | Python | 3.11 |
| Backend Framework | FastAPI | 0.110+ |
| ORM | SQLAlchemy | 2.0 |
| Data Validation | Pydantic | v2 |
| ASGI Server | Uvicorn | latest |
| Auth | python-jose + bcrypt | 3.x / latest |
| DB Migrations | Alembic | 1.x |
| Database | PostgreSQL | 15 |
| Containerization | Docker | 25.x |
| Local Orchestration | Docker Compose | v2 |
| Container Orchestration | Kubernetes (Minikube) | 1.29+ |
| CI/CD | Jenkins | LTS |
| Metrics Collection | Prometheus | 2.x |
| Metrics Visualization | Grafana | 10.x |
| Infrastructure as Code | Ansible | 2.x |
| Cloud Provider | AWS EC2 | Free Tier |
| Reverse Proxy | Nginx | latest |
| AI Companion | Groq — Llama 3.3-70b | latest |
| Testing | PyTest + coverage.py | latest |

---

## Quick Start

### Prerequisites

- Docker Desktop installed
- Python 3.11+ and Node.js 20+ (manual setup only)

### Option 1 — Docker Compose (fastest)

```bash
cd mindbridge-backend

cp .env.example .env
# Edit .env — set AI_API_KEY to your Groq API key

docker compose up --build
```

| Service | URL |
|---------|-----|
| API Swagger | http://localhost:8000/docs |
| Frontend | http://localhost:5173 (run separately) |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 — admin / (GRAFANA_ADMIN_PASSWORD from .env) |

### Option 2 — Manual Setup

**Backend:**
```bash
cd mindbridge-backend
python -m venv venv
source venv/bin/activate        # Linux/macOS
# venv\Scripts\activate         # Windows

pip install -r requirements.txt
cp .env.example .env

alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd mindbridge-frontend
npm install
echo "VITE_API_URL=http://localhost:8000/api/v1" > .env.local
npm run dev
```

### Option 3 — Kubernetes (Minikube)

> Run all minikube commands from **Git Bash** on Windows, not PowerShell.

```bash
# Start cluster
minikube start --driver=docker --memory=2200 --cpus=2
minikube addons enable ingress

# Build and load images
docker build -t mindbridge-api:latest ./mindbridge-backend
minikube image load mindbridge-api:latest
minikube image load postgres:15-alpine

# Deploy
cd mindbridge-backend
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/ -n mindbridge

# Wait for pods
kubectl get pods -n mindbridge -w
```

---

## CI/CD Pipeline (Jenkins)

Triggered automatically on every push to `main` or `dev` via GitHub webhook.

| Stage | What happens | On failure |
|-------|-------------|------------|
| 1. Checkout | Clone latest code | Abort |
| 2. Build | Install Python dependencies | Abort |
| 3. Lint | flake8 code style check | Warning only |
| 4. Test | PyTest suite + coverage report | Abort if coverage < 80% |
| 5. Security Scan | bandit analysis | Warning only |
| 6. Docker Build | Build API + frontend images | Abort |
| 7. Docker Push | Push to Docker Hub (main branch only) | Abort |
| 8. Deploy | kubectl apply — rolling update | Alert + abort |
| 9. Notify | Success or failure message | — |

Config: `Jenkinsfile` in the repository root.

---

## Testing

```bash
cd mindbridge-backend

# Full test suite with coverage
pytest tests/ -v --cov=app --cov-report=html --cov-report=term-missing

# Specific module
pytest tests/test_auth.py -v
```

**65 tests passed — 81.84% coverage** (pipeline requires minimum 80%)

| Test File | Tests | Covers |
|-----------|-------|--------|
| test_auth.py | 13 | Register, login, JWT, profile |
| test_mood.py | 11 | Check-in, history, trends, privacy |
| test_journal.py | 8 | CRUD, admin blocked, cross-user blocked |
| test_forum.py | 11 | Posts, replies, moderation, anonymity |
| test_crisis.py | 10 | Submission, admin alerts, resolution |
| test_resources.py | 12 | Listing, admin CRUD, categories |

---

## Cloud Deployment — AWS EC2

Deployed on **AWS EC2 (eu-north-1)**.

| Detail | Value |
|--------|-------|
| Provider | Amazon Web Services |
| Instance | t3.micro |
| OS | Ubuntu 22.04 LTS |
| Region | eu-north-1 (Stockholm) |
| Ports open | 80, 443, 8000, 9090, 3001 |

**Provision the server with Ansible:**

```bash
# Install Docker, Python, Git, Nginx on VPS
ansible-playbook -i ansible/inventory/hosts.ini ansible/playbooks/install_dependencies.yml

# Deploy app + configure Nginx + run migrations
ansible-playbook -i ansible/inventory/hosts.ini ansible/playbooks/deploy_app.yml
```

---

## Privacy Architecture

| Data | Storage method | Admin can see? |
|------|---------------|----------------|
| Mood check-ins | `anon_token` — HMAC-SHA256 of user_id | Aggregate stats only |
| Journal entries | Stored with `user_id`, API blocks admin access | Never |
| Forum posts | Auto-generated `anon_name` e.g. "Teal Sparrow" | Never linked to account |
| Crisis flags | No `user_id` column — structurally anonymous | Identity impossible |
| Post likes | `anon_token` only | Never |
| AI conversations | Not stored server-side | Never |

---

## API Reference

Full documentation at `/docs` (Swagger UI) and `/redoc` when the server is running.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/register` | — | Register student |
| POST | `/api/v1/auth/login` | — | Login — returns JWT |
| GET | `/api/v1/auth/me` | Student | Own profile |
| POST | `/api/v1/mood/checkin` | Student | Daily mood check-in |
| GET | `/api/v1/mood/history` | Student | Own mood history |
| GET | `/api/v1/mood/trends` | Admin | Campus-wide trends |
| GET | `/api/v1/journal/entries` | Student | List entries |
| POST | `/api/v1/journal/entry` | Student | Create entry |
| GET | `/api/v1/forum/posts` | Auth | Browse forum |
| POST | `/api/v1/forum/post` | Student | Anonymous post |
| POST | `/api/v1/crisis/flag` | Student | Submit crisis flag |
| GET | `/api/v1/crisis/alerts` | Admin | View all flags |
| GET | `/api/v1/resources` | Auth | Resource library |
| POST | `/api/v1/ai/chat` | Student | MindBot chat |
| GET | `/health` | — | Health check |
| GET | `/metrics` | — | Prometheus metrics |

---

## Project Structure

```
Mindbridge_app/
├── mindbridge-backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, middleware, lifespan
│   │   ├── config.py            # Settings from .env
│   │   ├── database.py          # SQLAlchemy engine + session
│   │   ├── models/              # User, Mood, Journal, Forum, Crisis, Resource
│   │   ├── schemas/             # Pydantic v2 request/response schemas
│   │   ├── routes/              # auth, mood, journal, forum, crisis, resources, ai
│   │   └── services/            # Business logic layer
│   ├── tests/                   # 65 tests, 81.84% coverage
│   ├── k8s/                     # 8 Kubernetes manifest files
│   ├── ansible/                 # 2 Ansible playbooks + inventory
│   ├── monitoring/              # Prometheus + Grafana config
│   ├── Dockerfile               # Multi-stage Python build
│   ├── docker-compose.yml       # API + DB + Prometheus + Grafana
│   └── Jenkinsfile              # 9-stage CI/CD pipeline
│
└── mindbridge-frontend/
    ├── src/
    │   ├── pages/               # 20+ screens (.tsx)
    │   ├── components/          # SideNav, BottomNav, AdminSideNav
    │   ├── context/             # AuthContext — JWT state
    │   └── api/                 # Axios client + all API calls
    ├── Dockerfile               # Multi-stage Node build + Nginx
    └── nginx.conf               # SPA routing + API proxy
```

---

## Exam Deliverables

| Section | Marks | Evidence |
|---------|-------|---------|
| Infrastructure + VPS (AWS EC2) | 15 | Docker Compose + K8s YAMLs + Ansible |
| Scrum / Burndown | 5 | Team docs |
| CI/CD Jenkins | 10 | `Jenkinsfile` — 9 stages |
| Prometheus + Grafana | 2.5 | `monitoring/` |
| Ansible | 2.5 | `ansible/playbooks/` — 2 playbooks |
| Robust Testing | 10 | 65 tests, 81.84% coverage |
| Kubernetes | 15 | 8 YAML files in `k8s/` |
| Architecture | 20 | SAD document + UML + C4 model |
| Innovation | 10 | MindBot AI Companion — Groq Llama 3.3-70b |
| Documentation | 15 | README + Swagger UI + User Manual |
| **Total** | **105** | |

---

## Team

| Name | Matricule | Role |
|------|-----------|------|
| EBODE ADA ERIKA ALEXANDRA | ICTU20233909 | Team Leader — Backend, Auth, DB Models, K8s, Ansible |
| AJA CHELLA ASAMBA JR | ICTU20233787 | Frontend, DevOps, Monitoring, CI/CD |

ICT University of Cameroon — SEN3244 Software Architecture — Spring 2026
