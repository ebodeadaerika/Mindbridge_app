# 🧠 MindBridge — Student Wellness Platform

> **A Privacy-First Campus Mental Health Platform**  
> SEN3244 — Software Architecture | Spring 2026 | ICT University of Cameroon  
> Instructor: Engr. TEKOH PALMA

[![Tests](https://img.shields.io/badge/tests-65%20passed-brightgreen)]()
[![Coverage](https://img.shields.io/badge/coverage-81.84%25-brightgreen)]()
[![Python](https://img.shields.io/badge/python-3.11-blue)]()
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green)]()
[![React](https://img.shields.io/badge/React-18-61DAFB)]()

---

## 📋 What is MindBridge?

MindBridge is a full-stack campus mental health platform built for students at African universities — where institutional counseling support is often limited. Students can track their mood anonymously, write private journal entries, support each other in an anonymous forum, access wellness resources, flag crises, and chat with an AI wellness companion.

**Core design principle:** No admin can ever identify which student submitted what — this is enforced at the **data layer**, not just the API.

---

## ✨ Features

| Feature | Description | Privacy |
|---------|-------------|---------|
| 📊 Mood Check-in | Daily 1–5 mood + energy score with optional note | `anon_token` only — never `user_id` |
| 📓 Private Journal | Create, read, update, delete personal entries | Admin access structurally blocked |
| 💬 Anonymous Forum | Post and reply using auto-generated animal names | `user_id` never in API responses |
| 🆘 Crisis Flagging | Low/Medium/High severity alerts for counselors | No identity column in DB |
| 📚 Resource Library | Articles, hotlines, coping exercises, breathing guides | Admin-managed, all users read |
| 🤖 MindBot AI Chat | 24/7 empathetic AI companion (Claude API) | Conversation not stored server-side |
| 👤 Profile | Update name, university, avatar | Standard auth |
| 🔐 Google SSO | Sign in with institutional Google account | OAuth 2.0 |

---

## 🏗️ Architecture

**Hybrid Architecture** combining four styles:
- **N-Tier Layered** — 5 strict layers (primary pattern)
- **Client-Server** — React SPA ↔ FastAPI over REST/HTTP
- **Service-Oriented (SOA)** — independent containerised services (API, DB, Prometheus, Grafana)
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

See [`08_Architecture/SAD.md`](08_Architecture/SAD.md) for the full Software Architecture Document with UML diagrams, C4 model, and trade-off analysis.

---

## 🚀 Quick Start

### Prerequisites
- Docker Desktop (for Option 1)
- Python 3.11+ and Node.js 20+ (for Option 2)

### Option 1: Docker Compose *(fastest — recommended)*

```bash
cd mindbridge-backend

# Copy and configure environment
cp .env.example .env
# Edit .env: set AI_API_KEY to your Anthropic/OpenAI key

# Start all services (API + DB + Prometheus + Grafana)
docker compose up --build

# Verify
curl http://localhost:8000/health
```

| Service | URL |
|---------|-----|
| API (Swagger) | http://localhost:8000/docs |
| Frontend | http://localhost:5173 (run separately) |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 (admin / mindbridge123) |

### Option 2: Manual Setup

**Backend:**
```bash
cd mindbridge-backend
python -m venv venv
source venv/bin/activate        # Linux/macOS
# venv\Scripts\activate         # Windows

pip install -r requirements.txt
cp .env.example .env            # Fill in DATABASE_URL, SECRET_KEY, AI_API_KEY

alembic upgrade head            # Create database tables
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd mindbridge-frontend
npm install
# Create .env.local:
echo "VITE_API_URL=http://localhost:8000/api/v1" > .env.local
echo "VITE_GOOGLE_CLIENT_ID=your-google-client-id" >> .env.local
npm run dev                     # http://localhost:5173
```

### Option 3: Kubernetes (Minikube)

> **Windows users:** Run all minikube commands from **Git Bash**, not PowerShell.

```bash
# Start fresh cluster (Git Bash on Windows)
/c/minikube/minikube.exe start --driver=docker --memory=2200 --cpus=2
/c/minikube/minikube.exe addons enable ingress

# Tag and load images into minikube
docker tag mindbridge-backend-api:latest yourdockerhubuser/mindbridge-api:latest
/c/minikube/minikube.exe image load yourdockerhubuser/mindbridge-api:latest
/c/minikube/minikube.exe image load postgres:15-alpine
/c/minikube/minikube.exe image load yourdockerhubuser/mindbridge-frontend:latest

# Deploy all 8 manifests
cd mindbridge-backend
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/pvc.yaml -n mindbridge
kubectl apply -f k8s/ingress.yaml -n mindbridge
kubectl apply -f k8s/service.yaml -n mindbridge
kubectl apply -f k8s/networkpolicy.yaml -n mindbridge
kubectl apply -f k8s/deployment.yaml -n mindbridge
kubectl apply -f k8s/frontend.yaml -n mindbridge
kubectl apply -f k8s/hpa.yaml -n mindbridge

# Wait for pods
kubectl wait pod -n mindbridge -l component=db --for=condition=Ready --timeout=180s
kubectl get pods -n mindbridge
```

---

## 🧪 Testing

```bash
cd mindbridge-backend

# Run full test suite with coverage
pytest tests/ -v --cov=app --cov-report=html --cov-report=term-missing

# Run specific test file
pytest tests/test_auth.py -v

# Run with HTML report
pytest tests/ --cov=app --cov-report=html
# Open htmlcov/index.html in browser
```

**Current results: 65 tests passed, 81.84% coverage** (required: 80%)

| Test File | Tests | Coverage Focus |
|-----------|-------|----------------|
| test_auth.py | 13 | Register, login, JWT, profile |
| test_mood.py | 11 | Check-in, history, trends, privacy |
| test_journal.py | 8 | CRUD, admin blocked, cross-user blocked |
| test_forum.py | 11 | Posts, replies, moderation, anonymity |
| test_crisis.py | 10 | Submission, admin alerts, resolution |
| test_resources.py | 12 | Listing, admin CRUD, categories |

---

## 📁 Project Structure

```
MindBridge_Project/
│
├── 08_Architecture/
│   ├── Architecture_Notes.md    # Architecture decisions + rationale
│   └── SAD.md                   # Full Software Architecture Document + UML
│
├── mindbridge-backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, middleware, routers
│   │   ├── config.py            # Settings (loaded from .env)
│   │   ├── database.py          # SQLAlchemy engine + session
│   │   ├── limiter.py           # slowapi rate limiter singleton
│   │   ├── models/              # SQLAlchemy models (User, Mood, Journal, Forum, Crisis, Resource)
│   │   ├── schemas/             # Pydantic v2 request/response schemas
│   │   ├── routes/              # FastAPI route handlers (auth, mood, journal, forum, crisis, resources, ai)
│   │   ├── services/            # Business logic layer
│   │   └── middleware/          # JWT auth + role-based access control
│   ├── tests/                   # PyTest suite (81.84% coverage)
│   │   ├── conftest.py          # Shared fixtures (test DB, mocks, auth tokens)
│   │   └── test_*.py            # 6 test modules, 65 tests
│   ├── k8s/                     # Kubernetes manifests
│   │   ├── namespace.yaml       # mindbridge namespace
│   │   ├── deployment.yaml      # API deployment (2 replicas, rolling update)
│   │   ├── service.yaml         # ClusterIP services + PostgreSQL deployment
│   │   ├── ingress.yaml         # Ingress + ConfigMap + Secrets
│   │   ├── pvc.yaml             # PostgreSQL PersistentVolumeClaim (5Gi)
│   │   ├── hpa.yaml             # HorizontalPodAutoscaler (2-8 replicas, CPU > 70%)
│   │   ├── frontend.yaml        # Frontend deployment + service
│   │   ├── networkpolicy.yaml   # Network isolation (DB accessible only from API)
│   │   ├── kustomization.yaml   # Apply all with: kubectl apply -k k8s/
│   │   └── deploy.sh            # One-command Minikube deployment script
│   ├── ansible/
│   │   ├── ansible.cfg          # Ansible configuration
│   │   ├── inventory/hosts.ini  # VPS inventory
│   │   ├── playbooks/
│   │   │   ├── install_dependencies.yml  # Docker, Python, Nginx setup
│   │   │   └── deploy_app.yml            # App deployment + Nginx config
│   │   └── templates/.env.j2    # Jinja2 template for production .env
│   ├── monitoring/
│   │   ├── prometheus.yml       # Scrape config
│   │   ├── alerts.yml           # Alert rules (error rate, latency, pod count, crisis spike)
│   │   └── grafana/provisioning/
│   │       ├── datasources/prometheus.yml
│   │       └── dashboards/
│   │           ├── dashboard.yml          # Dashboard provider
│   │           └── mindbridge_api.json    # API health dashboard
│   ├── Dockerfile               # Multi-stage Python build
│   ├── docker-compose.yml       # Full stack (API + DB + Prometheus + Grafana)
│   ├── Jenkinsfile              # 9-stage CI/CD pipeline
│   ├── requirements.txt
│   └── .env.example
│
└── mindbridge-frontend/
    ├── src/
    │   ├── pages/               # 25 screens (Login, Register, Dashboard, Forum, MindBot, etc.)
    │   ├── components/          # SideNav, AdminSideNav, BottomNav, BrainBridgeLogo
    │   ├── context/AuthContext.tsx  # JWT state + login/logout
    │   ├── api/client.ts        # Axios instance + all API functions
    │   └── types/index.ts       # TypeScript interfaces
    ├── Dockerfile               # Multi-stage Node build + Nginx
    ├── nginx.conf               # SPA routing + API proxy
    └── .env.local.example
```

---

## 🔒 Privacy Architecture

| Data | Storage | Admin Can See? |
|------|---------|----------------|
| Mood check-ins | `anon_token` (HMAC-SHA256 of user_id) | Aggregate stats only |
| Journal entries | Stored with `user_id` but API blocks admin access | ❌ Never |
| Forum posts | Auto-generated `anon_name` like "Teal Sparrow" | ❌ Never linked to account |
| Crisis flags | No `user_id` column — structurally anonymous | ❌ Identity impossible |
| Post likes | `anon_token` only | ❌ Never |
| AI conversations | Not stored server-side | ❌ Never |

---

## 🌐 API Reference

The API is fully documented via **Swagger UI** at `/docs` when the server is running.

### Key Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/register` | — | Register new student |
| POST | `/api/v1/auth/login` | — | Login (returns JWT) |
| GET | `/api/v1/auth/me` | Student | Get own profile |
| POST | `/api/v1/mood/checkin` | Student | Daily mood check-in |
| GET | `/api/v1/mood/history` | Student | Own mood history |
| GET | `/api/v1/mood/trends` | Admin | Campus-wide trends |
| GET | `/api/v1/journal/entries` | Student | List own journal entries |
| POST | `/api/v1/journal/entry` | Student | Create journal entry |
| GET | `/api/v1/forum/posts` | Any auth | Browse forum |
| POST | `/api/v1/forum/post` | Student | Create anonymous post |
| POST | `/api/v1/crisis/flag` | Student | Submit crisis flag |
| GET | `/api/v1/crisis/alerts` | Admin | View all flags |
| GET | `/api/v1/resources` | Any auth | Browse resource library |
| POST | `/api/v1/ai/chat` | Student | Chat with MindBot |
| GET | `/health` | — | Health check |
| GET | `/metrics` | — | Prometheus metrics |

---

## 📊 Exam Deliverables

| Section | Marks | Status | Evidence |
|---------|-------|--------|---------|
| Infrastructure + VPS | 15 | ✅ | Docker Compose + K8s YAMLs |
| Scrum / Burndown | 5 | ✅ | `09_Team_Docs/` |
| CI/CD Jenkins | 10 | ✅ | `Jenkinsfile` (9 stages) |
| Prometheus + Grafana | 2.5 | ✅ | `monitoring/` |
| Ansible | 2.5 | ✅ | `ansible/playbooks/` (2 playbooks) |
| Robust Testing | 10 | ✅ | 65 tests, 81.84% coverage |
| Kubernetes | 15 | ✅ | 8 YAML files in `k8s/` |
| Architecture | 20 | ✅ | `08_Architecture/SAD.md` (UML + trade-offs) |
| Innovation | 10 | ✅ | MindBot AI Companion (`/ai/chat`) |
| Documentation | 15 | ✅ | README + SAD + User Manual + Swagger |
| **Total** | **105** | **✅** | |

---

## 👥 Team

| Name | Matricule | Role |
|------|-----------|------|
| EBODE ADA ERIKA ALEXANDRA | ICTU20233909 | Team Leader · Backend Architecture & Testing |
| AJA CHELLA ASAMBA JR | ICTU20233787 | Frontend · DevOps & Infrastructure |

*ICT University of Cameroon — Spring 2026*
