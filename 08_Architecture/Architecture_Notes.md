# MindBridge — Architecture Notes & Decisions

## Chosen Architecture: Layered (N-Tier)

### Justification
- Small 4-person team with 8-week deadline
- Clear separation of concerns
- Easy to test (each layer independently testable)
- Honest and well-argued — better than a poorly implemented microservices attempt
- Examiner awards marks for justified decisions, not complexity

### The Four Layers
```
┌─────────────────────────────────────────────────────┐
│              Presentation Layer                     │
│   React/TypeScript frontend  |  Swagger UI (/docs)  │
├─────────────────────────────────────────────────────┤
│              API / Routes Layer                     │
│        FastAPI route handlers & middleware          │
├─────────────────────────────────────────────────────┤
│            Business Logic Layer                     │
│   MoodService | JournalService | AIService | etc.   │
├─────────────────────────────────────────────────────┤
│             Data Access Layer                       │
│       SQLAlchemy ORM  |  Repository pattern         │
├─────────────────────────────────────────────────────┤
│               Database Layer                        │
│                  PostgreSQL 15                      │
└─────────────────────────────────────────────────────┘
```

---

## Trade-offs (For Architecture Document — Section 8, 20 marks)

| Quality Attribute | Advantage | Limitation | Mitigation |
|---|---|---|---|
| Performance | Async FastAPI handles concurrent requests well | Single process can bottleneck at extreme scale | Kubernetes HPA scales pod replicas |
| Scalability | Stateless design allows horizontal scaling | Entire app scales together — can't scale individual components | Database independently containerized |
| Security | All security enforced consistently across layers | Must be applied at every entry point | JWT middleware global + role checks at route level |
| Maintainability | Clear layer boundaries reduce coupling | N/A — this is the main strength | Enforced by repository pattern |
| Availability | Simple to replicate | Single point of failure if not replicated | Kubernetes maintains 2+ replicas, rolling updates |

---

## Key Architectural Structures (Required for Section 8)

### Component View
- Frontend (React SPA) communicates with Backend (FastAPI) via REST API
- Backend communicates with Database (PostgreSQL) via SQLAlchemy
- Backend communicates with external AI API (Groq) via HTTP
- Prometheus scrapes /metrics endpoint from Backend
- Grafana reads from Prometheus
- Jenkins CI/CD builds and deploys Backend container to Kubernetes
- Ansible provisions the VPS

### Deployment View
```
Oracle Cloud VPS
    └── Kubernetes Cluster (Minikube)
          ├── Nginx Ingress Controller (port 80/443)
          ├── FastAPI Pod (2+ replicas)
          │     └── Horizontal Pod Autoscaler (CPU > 70%)
          ├── PostgreSQL Pod
          │     └── PersistentVolumeClaim
          ├── Prometheus Pod
          └── Grafana Pod
```

### Module View (Python)
```
app/
├── main.py              (FastAPI app, routers)
├── database.py          (SQLAlchemy engine, session)
├── models/
│   ├── user.py
│   ├── mood.py
│   ├── journal.py
│   ├── forum.py
│   └── crisis.py
├── schemas/
│   ├── user.py          (Pydantic request/response)
│   ├── mood.py
│   ├── journal.py
│   ├── forum.py
│   └── crisis.py
├── routes/
│   ├── auth.py
│   ├── mood.py
│   ├── journal.py
│   ├── forum.py
│   ├── crisis.py
│   ├── resources.py
│   └── ai.py
├── services/
│   ├── auth_service.py
│   ├── mood_service.py
│   ├── journal_service.py
│   ├── forum_service.py
│   ├── crisis_service.py
│   ├── resource_service.py
│   └── ai_service.py
└── middleware/
    ├── auth.py          (JWT verification)
    └── roles.py         (Role-based access control)
```

---

## UML Diagrams Required (Section 8)

1. **Use Case Diagram** — Student and Admin actors with all use cases
2. **Class Diagram** — All 5 data models with relationships
3. **Sequence Diagram 1** — Student login flow (Client → FastAPI → DB → JWT)
4. **Sequence Diagram 2** — Crisis flag submission (Student → API → DB → Admin alert)
5. **Sequence Diagram 3** — AI chat (Student → FastAPI → AI API → Response)
6. **Component Diagram** — All system components and their connections
7. **Deployment Diagram** — VPS, K8s, containers, networking

Use draw.io for all diagrams. Export as PNG for the report.

---

## Security Architecture

- All passwords: bcrypt hashed (never stored plaintext)
- All API communication: HTTPS (Nginx handles SSL termination)
- JWT tokens: expire after 24 hours
- Mood logs: stored with anon_token NOT user_id (anonymization at data layer)
- Journal entries: linked to user_id but inaccessible to admins (enforced at service layer)
- Database: not exposed to public internet (Docker private network only)
- Admin endpoints: HTTP 403 if accessed with student token

---

## Innovation — AI Wellness Companion (Section 9, 10 marks)

The innovation pitch:
"MindBridge addresses the mental health crisis silently affecting university students across Sub-Saharan Africa, where institutional support systems are largely absent. By combining anonymous mood tracking, peer support, and an AI-powered wellness companion, MindBridge creates a stigma-free first line of support — making mental healthcare accessible to every student with a smartphone, regardless of whether their campus has a counselor."

### Implementation
- POST /ai/chat endpoint
- Request: { "message": "string", "history": [{"role": "user"|"assistant", "content": "string"}] }
- System prompt instructs AI to: respond with empathy, never diagnose, include crisis resources if self-harm detected
- Uses Groq API (llama-3.3-70b-versatile)
- No server-side storage of conversations (privacy)

---

## CI/CD Pipeline (Jenkins — Section 3, 10 marks)

8 stages in Jenkinsfile:
1. Checkout — clone from GitHub
2. Build — pip install -r requirements.txt
3. Lint — flake8 app/
4. Test — pytest --cov=app --cov-report=html (abort if < 80%)
5. Docker Build — build image tagged with commit SHA
6. Docker Push — push to Docker Hub
7. Deploy — kubectl apply -f k8s/
8. Notify — success/failure notification

---

## Monitoring (Prometheus + Grafana — Section 4, 2.5 marks)

### Metrics Collected
- HTTP request rate per endpoint
- HTTP error rate (4xx and 5xx)
- Request latency (p50, p95, p99)
- Active database connections
- CPU and memory per Kubernetes pod
- AI Companion endpoint call frequency

### Grafana Dashboards
1. API Health Overview
2. Campus Wellbeing Pulse (mood check-in rate, average mood over time)
3. Crisis Alert Activity
4. Infrastructure Health (pod count, CPU, memory, uptime)

### Alerts
- High error rate: 5xx > 5% over 5 minutes → Critical
- Slow responses: p95 > 1000ms over 10 minutes → Warning
- Pod down: replicas < 2 → Critical
- Crisis spike: flags > 5 in 1 hour → High

---

## Ansible Playbooks (Section 5, 2.5 marks)

Playbook 1: install_dependencies.yml
- Install Docker, Python 3.11, Git, Nginx on the VPS

Playbook 2: deploy_app.yml
- Start application containers
- Configure firewall rules
- Set up Nginx reverse proxy

---

## Kubernetes Config (Section 7, 15 marks)

Files needed:
- Deployment.yaml (2+ replicas, rolling update strategy)
- Service.yaml (ClusterIP for internal, LoadBalancer for external)
- Ingress.yaml (Nginx Ingress Controller)
- PersistentVolumeClaim.yaml (PostgreSQL data persistence)
- HorizontalPodAutoscaler.yaml (scale when CPU > 70%)
- ConfigMap.yaml (environment configuration)
- Secret.yaml (database credentials, API keys — base64 encoded)
