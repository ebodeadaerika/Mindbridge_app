# MindBridge — Exam Presentation Slides
**SEN3244 Software Architecture | ICT University of Cameroon | Spring 2026**  
**Max 20 slides | ~7 minutes | Supervisor: Engr. TEKOH PALMA**

---

## SLIDE 1 — Title Slide

**MindBridge**  
*A Privacy-First Campus Mental Health Platform*

SEN3244 — Software Architecture  
ICT University of Cameroon | Spring 2026

**Team:**
- Member 1 — Backend & Testing
- Member 2 — Frontend & UX
- Member 3 — DevOps & Infrastructure
- Member 4 — Documentation & Scrum

Supervisor: Engr. TEKOH PALMA

---

## SLIDE 2 — The Problem

**34% of African university students meet criteria for a mental health disorder.**  
*(Ndetei et al., University of Dar es Salaam, 2021)*

**Yet only 8% ever seek help — why?**

❌ Visiting a counselor carries social stigma  
❌ No anonymous way to express distress  
❌ No system tracks student wellness over time  
❌ No mechanism for discreet crisis escalation  
❌ Zero support available evenings and weekends  

> *Students suffer in silence because the tools don't exist.*

---

## SLIDE 3 — Our Solution: MindBridge

**One platform. Six features. Complete privacy.**

| Feature | What It Does |
|---------|-------------|
| 📊 Daily Mood Check-in | Anonymous 1–5 mood + energy score |
| 📓 Private Journal | Encrypted entries — admins NEVER see |
| 💬 Anonymous Forum | Post as "Teal Sparrow" — no one knows it's you |
| 🆘 Crisis Flag | Alert counselors without revealing your identity |
| 📚 Resource Library | Articles, breathing exercises, hotlines |
| 🤖 MindBot AI | 24/7 empathetic AI companion (Claude API) |

**Core principle: Privacy enforced at the DATA LAYER — not just policy.**

---

## SLIDE 4 — Architecture Overview

**5-Layer N-Tier Architecture**

```
┌──────────────────────────────────────────┐
│  PRESENTATION    React 18 + TypeScript   │
├──────────────────────────────────────────┤
│  API / ROUTES    FastAPI + JWT + RBAC    │
├──────────────────────────────────────────┤
│  BUSINESS LOGIC  Services (7 modules)   │
├──────────────────────────────────────────┤
│  DATA ACCESS     SQLAlchemy ORM 2.0      │
├──────────────────────────────────────────┤
│  DATABASE        PostgreSQL 15           │
└──────────────────────────────────────────┘
```

**Why N-Tier?** Not microservices, not monolith — right complexity for a 4-person, 8-week project.  
Each layer independently testable → enabled 81.84% coverage.

---

## SLIDE 5 — Component Diagram

*(Show the Mermaid component diagram from SAD.md)*

**Key connections:**
- React SPA → Nginx Ingress → FastAPI Pods (×2)
- FastAPI → PostgreSQL (via SQLAlchemy)
- FastAPI → Anthropic Claude API (MindBot)
- Prometheus scrapes `/metrics` → Grafana dashboards
- Jenkins CI/CD → Docker → Kubernetes

**External integrations:** Anthropic Claude API, Google OAuth 2.0, SMTP

---

## SLIDE 6 — Privacy Architecture (Key Innovation)

**Problem:** How do you let admins monitor campus wellness WITHOUT exposing individual students?

**Our 3-layer privacy model:**

**Layer 1 — Pseudonymization**
```python
anon_token = HMAC-SHA256(user_id, SECRET_KEY)
```
Mood logs stored with `anon_token`, never `user_id`.

**Layer 2 — Structural Anonymization**
```sql
CREATE TABLE crisis_flags (
    id UUID, severity TEXT, message TEXT
    -- NO user_id column — impossible to link
);
```

**Layer 3 — RBAC Enforcement**
```python
# Admin token on journal endpoint → 403 Forbidden
if current_user["role"] != "student":
    raise HTTPException(status_code=403)
```

Admin sees aggregate trends. Never individual identities.

---

## SLIDE 7 — Database Design

*(Show simplified ERD)*

**6 tables:**

| Table | Privacy Mechanism |
|-------|-----------------|
| `users` | Source of truth — never joined to mood/crisis |
| `mood_logs` | `anon_token` (HMAC) — no `user_id` |
| `journal_entries` | `user_id` FK — API blocks admin access |
| `forum_posts` | `user_id` FK — `anon_name` in all responses |
| `crisis_flags` | **No `user_id` column at all** |
| `resources` | Public — admin-curated |

---

## SLIDE 8 — Scrum Process

**2 sprints × 2 weeks = 93 story points delivered**

| Sprint | Goal | Points | Result |
|--------|------|:------:|:------:|
| Sprint 1 | Auth + Wellness features | 36 | ✅ 36/36 |
| Sprint 2 | Admin + AI + DevOps | 54 | ✅ 54/54 |

**Average velocity: 45 story points/sprint**

*(Show Sprint 1 + Sprint 2 burndown charts)*

Both sprints were back-loaded — complex DevOps stories took longer to start. Identified in retrospective: spike infrastructure tasks first.

**Ceremonies held:** Sprint Planning, Daily Stand-up, Sprint Review, Sprint Retrospective

---

## SLIDE 9 — Testing Results

**Target: 80% | Achieved: 81.84%**

```
65 tests passed ✅  0 failed ✅  in 26.34s
```

| Test File | Tests | Focus |
|-----------|:-----:|-------|
| test_auth.py | 13 | Register, login, JWT, profile |
| test_mood.py | 11 | Check-in, history, trends, privacy |
| test_journal.py | 8 | CRUD, admin blocked, cross-user blocked |
| test_forum.py | 11 | Posts, replies, moderation, anonymity |
| test_crisis.py | 10 | Submission, admin alerts, resolution |
| test_resources.py | 12 | Listing, admin CRUD, categories |

**Critical security tests all pass:**
- Admin cannot access journal entries → 403 ✅
- Student cannot view crisis alerts → 403 ✅
- No `user_id` in mood/crisis responses ✅

---

## SLIDE 10 — CI/CD Pipeline (Jenkins)

**9-stage Jenkins pipeline — runs on every GitHub push**

```
GitHub Push
    ↓
[1] Checkout ─────────────────────────────── clone repo
[2] Build ────────────────────────────────── pip install + npm install
[3] Lint ─────────────────── parallel ─────  flake8 + eslint
[4] Test ─────────────────────────────────── pytest --cov-fail-under=80
[5] Security Scan ────────────────────────── bandit (fails on HIGH)
[6] Docker Build ──────────── parallel ─────  API image + Frontend image
[7] Docker Push ──────────── main only ─────  push to Docker Hub
[8] Deploy ───────────────── main only ─────  kubectl rollout restart
[9] Notify ────────────────────────────────── success/failure notification
```

**Pipeline gate:** Build fails if test coverage < 80%.  
**Security gate:** Build fails if Bandit finds HIGH severity issues.

---

## SLIDE 11 — Kubernetes Deployment

**8 Kubernetes manifest files in `k8s/` directory**

```
mindbridge namespace
├── Namespace
├── PersistentVolumeClaim (5Gi for PostgreSQL)
├── ConfigMap + Secret (environment config)
├── Deployment: API (2 replicas, initContainer)
├── Deployment: Frontend (2 replicas)
├── Deployment: PostgreSQL
├── Services (ClusterIP for all)
├── Ingress (Nginx, path-based routing)
├── HorizontalPodAutoscaler (2–8 pods, CPU 70%)
└── NetworkPolicy ×3 (DB/API/Frontend isolation)
```

**Deploy command:**
```bash
kubectl apply -k mindbridge-backend/k8s/
# OR: bash mindbridge-backend/k8s/deploy.sh
```

**HPA auto-scales API from 2 → 8 pods when CPU > 70%**

---

## SLIDE 12 — Monitoring (Prometheus + Grafana)

**Grafana dashboard: 6 panels**

| Panel | Metric |
|-------|--------|
| Total Requests | `http_requests_total` counter |
| Error Rate (%) | 5xx / total × 100 |
| Response Time p95 | `http_request_duration_seconds` histogram |
| Running Replicas | `kube_deployment_status_replicas` |
| Requests by Endpoint | Top routes by req/min |
| Latency Heatmap | p50 / p95 / p99 comparison |

**Alert rules configured:**
- Error rate > 5% → Critical alert
- p95 latency > 2s → Warning
- Replicas < 2 → Critical
- Crisis flags > 10/hour → Warning (surge detection)

Access: `http://localhost:3001` (admin / mindbridge123)

---

## SLIDE 13 — Ansible Configuration Management

**2 playbooks automate the entire VPS setup**

**Playbook 1: `install_dependencies.yml`**
- Installs Docker, Python 3.11, Nginx on Ubuntu VPS
- Configures UFW firewall (ports 22, 80, 443)
- Sets up Docker systemd service

**Playbook 2: `deploy_app.yml`**
- Templates `.env` from Jinja2 (`.env.j2`)
- Pulls latest Docker images
- Runs `docker compose up -d --build`
- Configures Nginx reverse proxy
- Health-checks the deployment post-start

```bash
# Single command to provision and deploy
ansible-playbook -i inventory/hosts.ini \
    playbooks/install_dependencies.yml \
    playbooks/deploy_app.yml
```

---

## SLIDE 14 — MindBot AI Companion (Innovation)

**The differentiating feature: 24/7 AI wellness support**

**Technology:** Anthropic Claude API (claude-3-5-haiku)

**System prompt engineering:**
```
You are MindBot, an empathetic AI wellness companion for 
university students. Listen without judgment. Suggest 
evidence-based coping strategies. Guide toward professional 
support when appropriate. Do NOT diagnose or replace therapy.
```

**Privacy:** Conversations are NOT stored server-side.  
Client sends full conversation context per request.  
Closing the app clears history completely.

**Sample interaction:**

> *Student: "I'm really stressed about finals"*
>
> *MindBot: "I hear you — exam pressure is real and valid. Let's try a quick grounding technique: name 5 things you can see around you right now..."*

---

## SLIDE 15 — Frontend: Key Screens

**25 screens implemented | React 18 + TypeScript + Tailwind**

*(Screenshots / mockups of:)*

1. **Student Dashboard** — mood card, quick check-in, recent journal
2. **Mood History** — Recharts line chart with date range picker
3. **Anonymous Forum** — post cards with animal names ("Teal Sparrow")
4. **Crisis Support** — severity selector with immediate help contacts
5. **MindBot Chat** — chat bubble interface with typing indicator
6. **Admin Dashboard** — campus mood trends, crisis count, alert feed

**Responsive design:** Mobile (bottom nav) → Tablet → Desktop (side nav)

---

## SLIDE 16 — Security Summary

**Defence in depth — 9 layers**

| Layer | Control |
|-------|---------|
| Network | Kubernetes NetworkPolicy (DB only accessible from API) |
| Transport | TLS termination at Ingress |
| Auth | JWT (HS256, 30-min expiry) + bcrypt (cost 12) |
| Authorization | RBAC — role checked on every protected endpoint |
| Rate limiting | slowapi — 100 requests/minute per IP |
| Injection | SQLAlchemy ORM — parameterized queries only |
| Privacy | Structural anonymization (no user_id in crisis/mood) |
| Secrets | Kubernetes Secrets + .env (never committed) |
| Code | Bandit static analysis in CI pipeline |

**Bandit result: 0 HIGH, 0 MEDIUM severity issues.**

---

## SLIDE 17 — Architectural Trade-offs

**Honest discussion of choices made**

| Decision | Benefit | Trade-off |
|----------|---------|-----------|
| N-Tier over Microservices | Simple, testable, right for team size | Cannot scale individual features independently |
| No server-side AI chat storage | GDPR data minimization, privacy | AI has no memory between sessions |
| Structural anonymization (no user_id in crisis_flags) | Privacy is impossible to bypass | Cannot contact student even if they want to be contacted |
| Minikube over cloud K8s | Free for students | Not production-grade; single-node |
| PostgreSQL over MongoDB | ACID compliance, strong ORM | Requires migrations for schema changes |

**The most important trade-off:** Structural anonymization of crisis flags means counselors cannot proactively reach out — the student must include contact info voluntarily. This is a deliberate privacy-safety balance.

---

## SLIDE 18 — Results Summary

**All objectives delivered ✅**

| Objective | Target | Achieved |
|-----------|:------:|:--------:|
| Test coverage | ≥ 80% | **81.84%** |
| Story points | 93 pts | **93/93 (100%)** |
| API endpoints | All features | **26 endpoints** |
| Frontend screens | All features | **25 screens** |
| K8s manifests | Deployment ready | **8 YAML files** |
| Jenkins stages | Full CI/CD | **9 stages** |
| Ansible playbooks | VPS automation | **2 playbooks** |
| Grafana panels | Observability | **6 panels** |
| UML diagrams | Architecture doc | **7 diagrams** |

**Exam sections covered: 10/10 | Total marks available: 105**

---

## SLIDE 19 — Recommendations

**5 things we would do with more time:**

1. **WebSockets** — Real-time crisis alerts without page refresh
2. **React Native** — Native mobile app sharing the same API
3. **PWA + Offline mode** — Journal works without internet (Service Workers)
4. **Clinical screening** — PHQ-9/GAD-7 integration with auto-escalation
5. **Client-side journal encryption** — Web Crypto API so even DB breach reveals nothing

**Process improvements:**
- Spike infrastructure stories before committing to sprint
- Playwright E2E tests for critical UI flows
- Story point reference card for infrastructure tasks

---

## SLIDE 20 — Conclusion

**MindBridge bridges the gap between student distress and campus support.**

**Three things that make it different:**

1. **Privacy by design** — Not policy, not configuration. The database schema structurally prevents identity leakage. A compromised admin account still cannot identify a student who submitted a crisis flag.

2. **Full-stack delivery** — Working code, working tests, working CI/CD, working Kubernetes deployment. Not just architecture diagrams — a real deployable system.

3. **Real problem, real solution** — 34% of African university students meet criteria for a mental health disorder. MindBridge gives them a safe, anonymous, always-on support channel.

---

> *"The most important lesson: privacy, like security, is a design property — not a configuration option."*

**Thank you.**  
Questions welcome.

---

*Appendix slides available on request:  
ERD detail | Full burndown tables | Bandit output | Coverage HTML report*
