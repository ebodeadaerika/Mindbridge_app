# MindBridge — 7-Minute OBS Demo Script
## SEN3244 Software Architecture — Exam Video Walkthrough

---

> **Setup before recording**: Arrange windows for quick switching.
> Open: File Explorer, VS Code (project root), Terminal (PowerShell/Git Bash), Browser

---

## Segment 1 — Project Overview (0:00–0:45)

**Show**: File Explorer at `MindBridge_Project/`

**Say**:
> "MindBridge is a student mental health platform addressing the 34% anxiety prevalence at African universities.
> It features anonymous mood tracking, private journaling, AI wellness companion, peer support forum,
> and crisis flagging — all built with a 5-layer N-Tier architecture."

**Show**: Project structure (key folders):
```
mindbridge-backend/    ← FastAPI + PostgreSQL
mindbridge-frontend/   ← React 18 + TypeScript
k8s/                   ← 8 Kubernetes manifests
ansible/               ← 2 Ansible playbooks
monitoring/            ← Prometheus + Grafana
```

---

## Segment 2 — Live Application Demo (0:45–2:30)

### Start the stack (if not running):
```bash
cd mindbridge-backend
docker compose up -d
```

**Show**: Docker Desktop — 4 containers running (api, db, prometheus, grafana)

### Demo the API (browser or curl):

**Open**: `http://localhost:8000/docs` (Swagger UI)

**Say**:
> "This is the FastAPI Swagger UI — all 26 endpoints are documented.
> Let me demonstrate the privacy model live."

**Demo** (use Swagger UI or curl in terminal):
```bash
# 1. Register (note: university email required)
# 2. Login → get JWT token
# 3. POST /api/v1/mood/checkin — show response has NO user_id
# 4. POST /api/v1/crisis/flag — show response has NO user_id
# 5. POST /api/v1/forum/post — show anon_name (e.g. "Green Lynx")
```

**Show the key privacy responses**:
```json
// Mood — no user_id
{"id":"...","mood_score":4,"energy_level":4,"note":"...","date":"2026-05-21"}

// Crisis flag — no user_id
{"id":"...","severity":"low","resolved":false,"created_at":"..."}

// Forum post — animal name only
{"anon_name":"Green Lynx","body":"..."}
```

**Say**:
> "The privacy architecture uses HMAC-SHA256 pseudonymization for mood logs,
> structural anonymization (no user_id column) for crisis flags,
> and auto-generated animal names for forum posts."

---

## Segment 3 — Testing & Coverage (2:30–3:15)

**Show**: Terminal at `mindbridge-backend/`

```bash
cd mindbridge-backend
python -m pytest tests/ -v --tb=short 2>&1 | tail -20
```

**Or show previously captured output** (if running tests takes too long):
```
65 passed in 12.3s
Coverage: 81.84%
```

**Show**: `coverage_report.txt` or browser report at `htmlcov/index.html`

**Say**:
> "We have 65 tests passing with 81.84% coverage across all 6 modules:
> auth, mood, journal, forum, crisis, and resources."

---

## Segment 4 — Kubernetes Deployment (3:15–4:15)

**Show**: Terminal

```bash
# Show all resources running
kubectl get pods -n mindbridge
kubectl get ingress -n mindbridge
kubectl get hpa -n mindbridge
```

**Expected output**:
```
NAME                                   READY   STATUS    RESTARTS
mindbridge-api-xxx                     1/1     Running   0
mindbridge-db-xxx                      1/1     Running   0
mindbridge-frontend-xxx                1/1     Running   0

NAME                 HOSTS              ADDRESS        PORTS
mindbridge-ingress   mindbridge.local   192.168.49.2   80

NAME                 REFERENCE     TARGETS    MINPODS  MAXPODS
mindbridge-api-hpa   mindbridge-api  cpu:70%   2        8
```

**Show**: `k8s/` directory — 8 YAML files

**Say**:
> "The Kubernetes deployment uses 8 manifest files: namespace, PVC, configmap/secrets,
> services, network policies, API deployment, frontend deployment, and HPA.
> The HPA auto-scales from 2 to 8 API replicas based on CPU/memory usage."

---

## Segment 5 — CI/CD Pipeline (4:15–4:45)

**Show**: `mindbridge-backend/Jenkinsfile` in VS Code

**Say**:
> "The Jenkins CI/CD pipeline has 9 stages: Checkout, Install Dependencies,
> Lint, Test, Coverage Check, Security Scan with Bandit,
> Docker Build, Docker Push, and Deploy to Kubernetes."

**Show**: The 9-stage pipeline diagram in `PRESENTATION_SLIDES.md` (Slide 10)

---

## Segment 6 — Monitoring (4:45–5:15)

**Open browser**: `http://localhost:9090` (Prometheus)

**Say**:
> "Prometheus scrapes our /metrics endpoint every 15 seconds."

**Open**: `http://localhost:3001` (Grafana, login admin/admin)

**Show**: The MindBridge dashboard with 6 panels:
- Request Rate, Response Time, Error Rate, Active Users, Running Replicas, DB Connections

---

## Segment 7 — Architecture Documentation (5:15–6:00)

**Show**: `08_Architecture/SAD.md` in VS Code (briefly scroll)

**Say**:
> "The Software Architecture Document covers all 7 UML diagrams:
> Component, Deployment, Sequence diagrams, C4 context/container,
> and the privacy architecture."

**Show**: `FINAL_REPORT.md` title page

**Say**:
> "The 100-page academic report follows the exam template with 5 chapters:
> Introduction, Literature Review, Methodology, Results, and Recommendations."

---

## Segment 8 — Ansible & VPS (6:00–6:30)

**Show**: `ansible/playbooks/` — two YAML files

```bash
# On exam VPS (show if available), or show the playbook files:
cat ansible/playbooks/install_dependencies.yml | head -20
cat ansible/playbooks/deploy_app.yml | head -20
```

**Say**:
> "Two Ansible playbooks automate VPS provisioning: one installs Docker,
> PostgreSQL, and Python; the other clones the repo and runs docker compose."

---

## Segment 9 — Conclusion (6:30–7:00)

**Show**: `PRESENTATION_SLIDES.md` Slide 20 (Conclusion)

**Say**:
> "MindBridge demonstrates a complete software architecture solution:
> 5-layer N-Tier design, privacy-first anonymization, 65 tests at 81.84% coverage,
> full DevOps pipeline with Jenkins CI/CD, Kubernetes orchestration,
> and Ansible automation. The system successfully addresses the mental health
> crisis at African universities while protecting student privacy."

---

## Minikube Clean Restart (Do This Before Recording!)

The Minikube cluster may have accumulated resource pressure from development. Before recording the video, do a clean restart. **IMPORTANT: Run all minikube commands from Git Bash (not PowerShell) — the docker driver requires Git Bash on Windows.**

```bash
# 1. Delete old cluster and start fresh (Git Bash)
/c/minikube/minikube.exe delete
/c/minikube/minikube.exe start --driver=docker --memory=2200 --cpus=2

# 2. Enable ingress addon (wait ~2 min for it to be ready)
/c/minikube/minikube.exe addons enable ingress

# 3. Retag and load Docker images (the K8s deployment uses yourdockerhubuser/* tags)
docker tag mindbridge-backend-api:latest yourdockerhubuser/mindbridge-api:latest
/c/minikube/minikube.exe image load yourdockerhubuser/mindbridge-api:latest
/c/minikube/minikube.exe image load postgres:15-alpine
/c/minikube/minikube.exe image load yourdockerhubuser/mindbridge-frontend:latest

# 4. Apply all K8s manifests (from mindbridge-backend directory)
cd /c/Users/bigchella/Downloads/MindBridge_Complete_Project/MindBridge_Project/mindbridge-backend
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/pvc.yaml -n mindbridge
kubectl apply -f k8s/ingress.yaml -n mindbridge
kubectl apply -f k8s/service.yaml -n mindbridge
kubectl apply -f k8s/networkpolicy.yaml -n mindbridge
kubectl apply -f k8s/deployment.yaml -n mindbridge
kubectl apply -f k8s/frontend.yaml -n mindbridge
kubectl apply -f k8s/hpa.yaml -n mindbridge

# 5. Wait for DB pod (takes ~2 min)
kubectl wait pod -n mindbridge -l component=db --for=condition=Ready --timeout=180s

# 6. DB is auto-created by POSTGRES_DB env var — just wait for API pods to be Ready
# Tables are auto-created by the API on first startup (may take 1-2 restarts due to
# parallel startup race condition — this is normal and resolves automatically)
kubectl wait pod -n mindbridge -l component=api --for=condition=Ready --timeout=180s

# 7. Verify all pods running
kubectl get pods -n mindbridge
kubectl get deployments -n mindbridge
```

**Expected output:**
```
NAME                                   READY   STATUS    RESTARTS
mindbridge-api-xxx                     1/1     Running   0
mindbridge-api-xxx                     1/1     Running   0
mindbridge-db-xxx                      1/1     Running   0
mindbridge-frontend-xxx                1/1     Running   0
mindbridge-frontend-xxx                1/1     Running   0
```

---

## Quick Commands Reference

```bash
# Start Docker Compose stack
cd mindbridge-backend && docker compose up -d

# Check API health
curl http://localhost:8000/health

# Run tests
python -m pytest tests/ -v --cov=app --cov-report=term-missing

# Check K8s pods
kubectl get pods -n mindbridge

# Check ingress
kubectl get ingress -n mindbridge

# Port-forward to access API from K8s
kubectl port-forward svc/mindbridge-api-service 8080:80 -n mindbridge

# Minikube IP
C:\minikube\minikube.exe ip

# Add to hosts (run as Admin in PowerShell):
Add-Content C:\Windows\System32\drivers\etc\hosts "192.168.49.2 mindbridge.local"
```

---

## Common Issues During Demo

| Issue | Quick Fix |
|-------|-----------|
| Pods not ready | `kubectl get pods -n mindbridge` — wait 30s |
| DB not found | Tables already created; just wait for pod to start |
| Health check failing | Wait for `delay=10s` readiness probe |
| Frontend not loading | Check `kubectl get ingress -n mindbridge` has an ADDRESS |
| Port-forward drops | Re-run `kubectl port-forward` command |
