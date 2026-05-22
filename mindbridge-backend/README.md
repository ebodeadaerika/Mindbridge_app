# 🧠 MindBridge — Backend API

> A student mental health and wellbeing platform  
> **Course:** SEN3244 — Software Architecture | **Semester:** Spring 2026  
> **University:** ICT University of Cameroon | **Instructor:** Engr. TEKOH PALMA

---

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-team/mindbridge-backend.git
cd mindbridge-backend

# 2. Copy environment variables
cp .env.example .env
# Edit .env with your actual values

# 3. Start everything with Docker Compose
docker compose up --build

# 4. API is running at:
#    http://localhost:8000
#    http://localhost:8000/docs  (Swagger UI)
#    http://localhost:8000/redoc (ReDoc)
#    http://localhost:9090       (Prometheus)
#    http://localhost:3001       (Grafana — admin/mindbridge123)
```

---

## 🏗️ Architecture

**Layered (N-Tier) Architecture:**

```
Presentation Layer  → Swagger UI (/docs) + React Frontend
API / Routes Layer  → FastAPI route handlers + middleware
Business Logic Layer→ Services (MoodService, AIService, etc.)
Data Access Layer   → SQLAlchemy 2.0 ORM
Database Layer      → PostgreSQL 15
```

---

## 📁 Project Structure

```
mindbridge-backend/
├── app/
│   ├── main.py          # FastAPI app entry point + router registration
│   ├── database.py      # SQLAlchemy engine + session factory
│   ├── config.py        # Pydantic Settings — all environment variables
│   ├── models/          # SQLAlchemy ORM models (6 tables)
│   ├── schemas/         # Pydantic v2 request/response schemas
│   ├── routes/          # FastAPI route handlers (7 routers)
│   ├── services/        # Business logic layer
│   └── middleware/      # JWT auth + role-based access control
├── tests/               # PyTest test suite (>= 80% coverage)
├── alembic/             # Database migration scripts
├── k8s/                 # Kubernetes YAML manifests
├── ansible/             # Infrastructure-as-Code playbooks
├── monitoring/          # Prometheus + Grafana configuration
├── Dockerfile           # Production container image
├── docker-compose.yml   # Local dev + monitoring stack
├── Jenkinsfile          # CI/CD pipeline (8 stages)
└── requirements.txt     # Python dependencies
```

---

## 🔑 API Endpoints

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| POST | `/api/v1/auth/register` | No | — |
| POST | `/api/v1/auth/login` | No | — |
| GET | `/api/v1/auth/me` | Yes | Any |
| PUT | `/api/v1/auth/me` | Yes | Any |
| POST | `/api/v1/mood/checkin` | Yes | Student |
| GET | `/api/v1/mood/history` | Yes | Student |
| GET | `/api/v1/mood/trends` | Yes | Admin |
| POST | `/api/v1/journal/entry` | Yes | Student |
| GET | `/api/v1/journal/entries` | Yes | Student |
| DELETE | `/api/v1/journal/entry/{id}` | Yes | Student |
| GET | `/api/v1/forum/posts` | Yes | Any |
| POST | `/api/v1/forum/post` | Yes | Student |
| POST | `/api/v1/forum/post/{id}/reply` | Yes | Student |
| DELETE | `/api/v1/forum/post/{id}` | Yes | Admin |
| POST | `/api/v1/crisis/flag` | Yes | Student |
| GET | `/api/v1/crisis/alerts` | Yes | Admin |
| PUT | `/api/v1/crisis/alerts/{id}/resolve` | Yes | Admin |
| GET | `/api/v1/resources` | Yes | Any |
| POST | `/api/v1/resources` | Yes | Admin |
| DELETE | `/api/v1/resources/{id}` | Yes | Admin |
| POST | `/api/v1/ai/chat` | Yes | Student |

---

## 🧪 Running Tests

```bash
# Activate virtual environment
python -m venv venv && source venv/bin/activate  # Linux/Mac
python -m venv venv && venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Run tests with coverage report
pytest --cov=app --cov-report=html --cov-report=term-missing

# Coverage must be >= 80% (NFR-14)
# Open htmlcov/index.html to view the detailed report
```

---

## 🔒 Privacy Rules (Never Break)

1. **MoodLog** uses `anon_token` — NEVER `user_id`. Admins cannot trace mood logs to individuals.
2. **JournalEntry** — service layer verifies `entry.user_id == current_user.id` before returning data.
3. **ForumPost** — auto-generated animal names only. Never linked to a user account.
4. **CrisisFlag** — no user identity stored unless student voluntarily includes it in their message.
5. `/mood/trends` — returns aggregated statistics ONLY. Never individual records.

---

## 🐳 Docker

```bash
# Build image
docker build -t mindbridge-api .

# Run with environment variables
docker run -p 8000:8000 --env-file .env mindbridge-api
```

---

## ☸️ Kubernetes (Minikube)

```bash
# Start Minikube
minikube start

# Enable Ingress
minikube addons enable ingress

# Apply all manifests
kubectl apply -f k8s/

# Check status
kubectl get pods
kubectl get services
kubectl get ingress
```

---

## 🤖 Ansible

```bash
# Install server dependencies (Playbook 1)
ansible-playbook -i ansible/inventory/hosts.ini ansible/playbooks/install_dependencies.yml

# Deploy application (Playbook 2)
ansible-playbook -i ansible/inventory/hosts.ini ansible/playbooks/deploy_app.yml
```

---

## 📊 Monitoring

- **Prometheus:** http://localhost:9090
- **Grafana:** http://localhost:3001 (admin / mindbridge123)
- **Metrics endpoint:** http://localhost:8000/metrics

---

## 🔧 Environment Variables

See `.env.example` for all available variables.

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | JWT signing key (min 32 chars) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime (default: 1440 = 24h) |
| `AI_API_KEY` | Anthropic / OpenAI API key |
| `AI_MODEL` | AI model name (default: claude-sonnet-4-20250514) |

---

*Built with 💚 by the MindBridge Team — ICT University of Cameroon, Spring 2026*
