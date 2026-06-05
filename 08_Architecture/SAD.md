# MindBridge — Software Architecture Document (SAD)
**Course:** SEN3244 Software Architecture  
**Section 8 — Architecture Documentation (20 marks)**  
**Version:** 1.0  | **Date:** May 2026

---

## Table of Contents
1. [System Overview](#1-system-overview)
2. [Architectural Drivers](#2-architectural-drivers)
3. [Architectural Style: Layered N-Tier](#3-architectural-style-layered-n-tier)
4. [Component View](#4-component-view)
5. [Use Case Diagram](#5-use-case-diagram)
6. [Class Diagram — Data Model](#6-class-diagram--data-model)
7. [Sequence Diagrams](#7-sequence-diagrams)
8. [Deployment View](#8-deployment-view)
9. [Security Architecture](#9-security-architecture)
10. [Technology Stack Decisions](#10-technology-stack-decisions)
11. [Quality Attribute Trade-offs](#11-quality-attribute-trade-offs)
12. [Privacy Architecture](#12-privacy-architecture)

---

## 1. System Overview

MindBridge is a campus mental-health platform serving students and administrators at African universities. Students can track their daily mood, write private journal entries, participate in an anonymous peer forum, access wellness resources, escalate a crisis flag, and chat with an AI wellness companion. Administrators view anonymised campus wellbeing trends, manage resources, moderate the forum, and respond to crisis alerts.

**Key constraints:**
- Privacy-first: no individual student data is ever exposed to admins
- Must work on mobile browsers at 4G speeds
- Deployable on a single Oracle Cloud VPS (student budget)
- Team of 4 — 8-week delivery window

---

## 2. Architectural Drivers

| ID | Driver | Category | Priority |
|----|--------|----------|----------|
| AD-01 | Student data must never be accessible to admins (journal, mood) | Security / Privacy | Critical |
| AD-02 | System must serve all registered students simultaneously | Performance / Scalability | High |
| AD-03 | Zero-downtime deployments (rolling updates) | Availability | High |
| AD-04 | New features can be added without refactoring the whole system | Maintainability | High |
| AD-05 | Each layer must be independently unit-testable | Testability | High |
| AD-06 | Deployable by a 4-person student team on a budget VPS | Cost / Operability | Medium |

---

## 3. Architectural Style: Layered N-Tier

### Decision
We chose a **5-layer N-Tier architecture** over microservices or event-driven alternatives.

### Justification

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **N-Tier (chosen)** | Clear separation; easy to test per layer; fits 4-person team; proven pattern | Cannot scale individual features independently | ✅ Chosen |
| Microservices | Independent scaling per service; fault isolation | Massive operational overhead; 4-person team insufficient; network latency between services | ❌ Rejected |
| Event-Driven | Loose coupling; great for async workflows | Complex to debug; overkill for a CRUD-heavy wellness app | ❌ Rejected |

### The Five Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                          │
│   React 18 + TypeScript SPA   │   Swagger UI (/docs)           │
│   Served by: Nginx (K8s pod)  │   Mobile-first, responsive     │
├─────────────────────────────────────────────────────────────────┤
│                      API / ROUTING LAYER                        │
│   FastAPI route handlers (Python 3.11)                         │
│   JWT Auth Middleware  │  Role-Based Access Control            │
│   Request validation (Pydantic v2)  │  Rate limiting (slowapi) │
├─────────────────────────────────────────────────────────────────┤
│                   BUSINESS LOGIC LAYER                          │
│   MoodService  │  JournalService  │  ForumService              │
│   CrisisService  │  ResourceService  │  AIService              │
│   AuthService  │  EmailService                                  │
├─────────────────────────────────────────────────────────────────┤
│                   DATA ACCESS LAYER                             │
│   SQLAlchemy ORM 2.0  │  Repository pattern                    │
│   Alembic migrations  │  Connection pooling                    │
├─────────────────────────────────────────────────────────────────┤
│                    DATABASE LAYER                               │
│               PostgreSQL 15 (Docker container)                 │
│          PersistentVolumeClaim (Kubernetes)                    │
└─────────────────────────────────────────────────────────────────┘
```

**Rule:** Each layer communicates only with the layer directly below it. Routes call services; services call the DB. No route handler contains SQL; no model contains business logic.

---

## 4. Component View

```mermaid
graph TB
    subgraph Client["Client (Browser / Mobile)"]
        React["React 18 SPA\n(TypeScript)"]
    end

    subgraph K8s["Kubernetes Cluster (Oracle Cloud VPS)"]
        subgraph Frontend["Frontend Pod (Nginx)"]
            Nginx["Nginx\nStatic SPA"]
        end

        subgraph API["API Pods × 2 (FastAPI)"]
            Routes["Route Handlers\n/auth /mood /journal\n/forum /crisis /resources /ai"]
            Middleware["JWT Auth\nRole Guard\nRate Limiter"]
            Services["Services\nMood | Journal | Forum\nCrisis | AI | Auth"]
        end

        subgraph DB["Database Pod"]
            Postgres[(PostgreSQL 15)]
        end

        subgraph Monitor["Monitoring"]
            Prometheus[Prometheus]
            Grafana[Grafana]
        end

        Ingress["Nginx Ingress\nController"]
    end

    subgraph External["External Services"]
        GroqAPI["Groq\nGroq API"]
        EmailSvc["Email / SMTP"]
    end

    React -->|"HTTPS"| Ingress
    Ingress -->|"/ (SPA)"| Nginx
    Ingress -->|"/api/*"| Routes
    Middleware --> Routes
    Routes --> Services
    Services -->|"SQLAlchemy ORM"| Postgres
    Services -->|"REST /messages"| GroqAPI
    Services -->|"SMTP"| EmailSvc
    Prometheus -->|"scrape /metrics"| Routes
    Grafana -->|"query"| Prometheus
```

---

## 5. Use Case Diagram

```mermaid
graph LR
    Student((Student))
    Admin((Admin))

    subgraph Authentication
        UC1[Register account]
        UC2[Login / SSO]
        UC3[Reset password]
    end

    subgraph Wellness Tracking
        UC4[Daily mood check-in]
        UC5[View mood history]
        UC6[Write journal entry]
        UC7[Read own journal]
    end

    subgraph Community
        UC8[Post anonymously to forum]
        UC9[Reply to forum posts]
        UC10[Browse resource library]
    end

    subgraph Crisis Support
        UC11[Submit crisis flag]
        UC12[Chat with AI companion]
    end

    subgraph Admin Functions
        UC13[View campus mood trends]
        UC14[Manage crisis alerts]
        UC15[Resolve crisis flag]
        UC16[Create / edit resources]
        UC17[Moderate forum posts]
    end

    Student --> UC1
    Student --> UC2
    Student --> UC3
    Student --> UC4
    Student --> UC5
    Student --> UC6
    Student --> UC7
    Student --> UC8
    Student --> UC9
    Student --> UC10
    Student --> UC11
    Student --> UC12

    Admin --> UC2
    Admin --> UC13
    Admin --> UC14
    Admin --> UC15
    Admin --> UC16
    Admin --> UC17
```

---

## 6. Class Diagram — Data Model

```mermaid
classDiagram
    class User {
        +UUID id
        +String name
        +String email (unique)
        +String password_hash
        +UserRole role
        +String university
        +String year_of_study
        +String avatar_url
        +DateTime created_at
        +DateTime updated_at
        +hash_password(plain)$ String
    }

    class MoodLog {
        +UUID id
        +String anon_token (HMAC-SHA256 of user_id)
        +Int mood_score (1-5)
        +Int energy_level (1-5)
        +String note
        +Date log_date
        +DateTime created_at
    }

    class JournalEntry {
        +UUID id
        +UUID user_id (FK → User)
        +String title
        +String body
        +DateTime created_at
        +DateTime updated_at
    }

    class ForumPost {
        +UUID id
        +UUID user_id (FK → User)
        +String anon_name (auto-generated)
        +String body (max 500)
        +String category
        +Int like_count
        +DateTime created_at
    }

    class ForumReply {
        +UUID id
        +UUID post_id (FK → ForumPost)
        +UUID user_id (FK → User)
        +String anon_name
        +String body
        +DateTime created_at
    }

    class PostLike {
        +UUID id
        +UUID post_id (FK → ForumPost)
        +String anon_token (HMAC-SHA256 of user_id)
    }

    class CrisisFlag {
        +UUID id
        +Enum severity (low/medium/high)
        +String message
        +Boolean resolved
        +String resolution_note
        +DateTime created_at
        +DateTime resolved_at
    }

    class Resource {
        +UUID id
        +String title
        +String category
        +String description
        +String url
        +UUID created_by (FK → User)
        +DateTime created_at
    }

    User "1" --> "0..*" JournalEntry : owns (private)
    User "1" --> "0..*" ForumPost : posts (anon)
    User "1" --> "0..*" ForumReply : replies (anon)
    User "1" --> "0..*" Resource : creates (admin only)
    ForumPost "1" --> "0..*" ForumReply : has
    ForumPost "1" --> "0..*" PostLike : receives

    note for MoodLog "anon_token = HMAC-SHA256(user_id)\nNEVER stores user_id directly"
    note for CrisisFlag "No user_id — completely anonymous"
    note for PostLike "anon_token only — no user identity"
```

---

## 7. Sequence Diagrams

### 7.1 — Student Login Flow

```mermaid
sequenceDiagram
    participant C as Client (React)
    participant A as FastAPI /auth/login
    participant M as JWT Middleware
    participant S as AuthService
    participant D as PostgreSQL

    C->>A: POST /api/v1/auth/login {email, password}
    A->>M: Rate limit check (10/min per IP)
    M-->>A: OK
    A->>S: authenticate(email, password)
    S->>D: SELECT user WHERE email = ?
    D-->>S: User row
    S->>S: bcrypt.verify(password, hash)
    alt Password correct
        S->>S: create_access_token(user_id, role)
        S->>S: create_refresh_token(user_id)
        S-->>A: {access_token, refresh_token, user}
        A-->>C: 200 {access_token, refresh_token, user}
        C->>C: Store tokens in localStorage
        C->>C: Navigate to /dashboard
    else Password wrong
        S-->>A: raise AuthenticationError
        A-->>C: 401 {detail: "Invalid credentials"}
    end
```

### 7.2 — Student Submits Crisis Flag

```mermaid
sequenceDiagram
    participant C as Client (React)
    participant A as FastAPI /crisis/flag
    participant M as Auth Middleware
    participant S as CrisisService
    participant D as PostgreSQL

    C->>A: POST /api/v1/crisis/flag {severity, message}\nAuthorization: Bearer <token>
    A->>M: Verify JWT token
    M->>M: Decode JWT → user_id, role
    alt Token invalid / expired
        M-->>C: 401 Unauthorized
    end
    M-->>A: Current user (role=student)
    A->>S: submit_flag(severity, message)
    Note over S: user_id deliberately NOT passed to service
    S->>D: INSERT INTO crisis_flags (severity, message)\nNO user_id column
    D-->>S: CrisisFlag record
    S-->>A: CrisisFlag schema
    A-->>C: 201 {id, severity, resolved: false}

    Note over D: Admin queries crisis_flags later
    Note over D: Only sees severity + message, never student identity
```

### 7.3 — AI Wellness Companion Chat

```mermaid
sequenceDiagram
    participant C as Client (React)
    participant A as FastAPI /ai/chat
    participant M as Auth + Rate Limit
    participant S as AIService
    participant X as Groq API

    C->>A: POST /api/v1/ai/chat\n{message, history[]}\nAuthorization: Bearer <token>
    A->>M: Verify JWT (30 req/min per user)
    M-->>A: OK
    A->>S: get_ai_response(message, history)
    S->>S: Build messages array:\n[system_prompt, ...history, user_msg]
    Note over S: System prompt:\n"You are a student wellness companion.\nNever diagnose. Include crisis resources\nif self-harm is detected."
    S->>X: POST /v1/messages\n{model, messages, max_tokens}
    X-->>S: {content: [{text: "AI response"}]}
    S-->>A: AI reply text
    A-->>C: 200 {reply: "..."}
    Note over C: History stored in React state ONLY\nNever persisted server-side (privacy)
```

---

## 8. Deployment View

```mermaid
graph TB
    subgraph Internet
        User["👤 Student Browser\n(Mobile / Desktop)"]
    end

    subgraph VPS["Oracle Cloud VPS (Ubuntu 22.04)"]
        subgraph K8s["Kubernetes (Minikube)"]
            Ingress["🔀 Nginx Ingress\n:80 / :443"]

            subgraph NS["Namespace: mindbridge"]
                FE1["🖥 Frontend Pod 1\n(Nginx + React)"]
                FE2["🖥 Frontend Pod 2\n(Nginx + React)"]

                API1["⚙ API Pod 1\n(FastAPI)"]
                API2["⚙ API Pod 2\n(FastAPI)"]

                DB["🗄 PostgreSQL Pod\n(postgres:15-alpine)"]
                PVC["💾 PersistentVolumeClaim\n5 Gi"]

                HPA["📈 HPA\n2-8 replicas\nCPU > 70%"]

                Prom["📊 Prometheus\n:9090"]
                Graf["📈 Grafana\n:3000"]
            end
        end

        Ansible["🔧 Ansible\n(provisioning)"]
        Jenkins["🏗 Jenkins CI/CD\n(build + deploy)"]
    end

    subgraph DockerHub["Docker Hub"]
        ImgAPI["mindbridge-api:latest"]
        ImgFE["mindbridge-frontend:latest"]
    end

    subgraph External["External APIs"]
        Groq["Groq\nGroq API"]
        SMTP["SMTP Server\n(email)"]
    end

    User -->|"HTTPS"| Ingress
    Ingress --> FE1
    Ingress --> FE2
    Ingress --> API1
    Ingress --> API2
    API1 --> DB
    API2 --> DB
    DB --> PVC
    HPA -.->|"scales"| API1
    HPA -.->|"scales"| API2
    Prom -->|"scrape"| API1
    Prom -->|"scrape"| API2
    Graf -->|"query"| Prom
    API1 --> GroqAPI
    API2 --> GroqAPI
    API1 --> SMTP
    Jenkins -->|"kubectl apply"| K8s
    Jenkins -->|"docker pull"| DockerHub
    Ansible -->|"provision"| VPS
```

---

## 9. Security Architecture

### Authentication & Authorisation
| Concern | Implementation |
|---------|----------------|
| Password storage | bcrypt (cost factor 12) — never plain-text |
| Session management | JWT access token (24h) + refresh token (30d) |
| Role enforcement | `require_student` / `require_admin` middleware on each route |
| Token transmission | `Authorization: Bearer <token>` header only |
| Google SSO | OAuth 2.0 implicit flow — Google verifies identity, we issue our own JWT |

### Data Security
| Data | Protection |
|------|-----------|
| Database | Not exposed publicly (ClusterIP only, NetworkPolicy blocks external access) |
| Mood logs | `anon_token = HMAC-SHA256(user_id + SECRET_KEY)` — cannot be reversed |
| Journal entries | Linked to `user_id` but `require_student` middleware blocks all admin access |
| Crisis flags | No `user_id` column exists — structurally impossible to identify the student |
| Forum posts | `anon_name` auto-generated (e.g. "Silver Flamingo") — no link to account |
| Post likes | `anon_token` only — same anonymisation as mood logs |
| AI conversations | Not stored server-side at all — client-side only |

### Network Security
```
Internet → Nginx Ingress (TLS termination) → ClusterIP services (no public access)
NetworkPolicy:
  - DB pod: accepts connections ONLY from API pods (port 5432)
  - API pods: accept connections ONLY from frontend pods + ingress-nginx namespace
  - Frontend pods: accept connections ONLY from ingress-nginx namespace
```

---

## 10. Technology Stack Decisions

| Component | Technology | Justification |
|-----------|-----------|---------------|
| Frontend | React 18 + TypeScript | Industry standard; strong typing catches bugs at compile time |
| Build tool | Vite | 10× faster HMR than CRA; native ESM |
| Styling | Tailwind CSS | Utility-first; no CSS drift; small production bundle |
| Backend | FastAPI (Python 3.11) | Async; auto-generates OpenAPI docs; Pydantic validation; 4× faster than Django REST |
| ORM | SQLAlchemy 2.0 | Type-safe; migration support via Alembic; PostgreSQL-optimised |
| Database | PostgreSQL 15 | ACID compliance; JSON column support; proven at scale |
| Auth | PyJWT + bcrypt | Stateless JWT; industry-standard password hashing |
| Testing | PyTest + pytest-cov | Simple fixtures; 81.84% coverage achieved |
| Container | Docker (multi-stage) | Small production images; reproducible builds |
| Orchestration | Kubernetes (Minikube) | Rolling updates; health probes; HPA; NetworkPolicy |
| CI/CD | Jenkins | Declarative pipeline; Docker build + push + K8s deploy |
| Monitoring | Prometheus + Grafana | De-facto standard; prometheus-fastapi-instrumentator auto-instruments endpoints |
| IaC | Ansible | Idempotent server provisioning; no agent required |

---

## 11. Quality Attribute Trade-offs

| Quality Attribute | Decision | Trade-off | Mitigation |
|-------------------|----------|-----------|------------|
| **Performance** | Async FastAPI with 2 uvicorn workers | Cannot use CPU-bound tasks in async handlers | Offload heavy tasks to background workers if needed |
| **Scalability** | Horizontal pod scaling (HPA, min 2 / max 8) | Database is single-instance bottleneck | Database connection pooling (SQLAlchemy pool_size=5) |
| **Security** | Strict NetworkPolicy; anon_token for mood/forum | Adds complexity | Well-documented privacy architecture |
| **Availability** | Rolling update (maxUnavailable=0); 2+ replicas | Rollout takes slightly longer | Acceptable for a campus app |
| **Maintainability** | Strict layer separation; services never in routes | Slightly more boilerplate | Pays dividends when adding features |
| **Cost** | Single VPS + Minikube vs. managed K8s | Limited compute | Sufficient for university scale; can migrate to EKS/GKE later |
| **Testability** | In-memory SQLite for tests; mock DNS + limiter | Test DB ≠ production DB | Critical paths validated with integration tests |

---

## 12. Privacy Architecture

MindBridge is designed so that **no admin can ever identify which student posted what**, even with full database access. This is enforced at the data layer, not just the API layer.

```
User Action                    What is stored in DB
─────────────────────────────────────────────────────────────────
Mood check-in           →  anon_token (HMAC-SHA256 of user_id)
                            mood_score, energy_level, note, date
                            ❌ NOT user_id

Journal entry           →  user_id, title, body
                            ✅ user_id IS stored (needed for privacy)
                            ❌ Blocked at API level — require_student
                               prevents any admin token from accessing

Forum post              →  anon_name (e.g. "Teal Sparrow"), body
                            user_id stored internally but NEVER
                            returned in API responses
                            ❌ NOT visible in GET /forum/posts

Crisis flag             →  severity, message
                            ❌ NOT user_id — column doesn't exist
                            The student is structurally unidentifiable

Post like               →  anon_token (HMAC-SHA256 of user_id)
                            ❌ NOT user_id

AI chat                 →  Not stored at all (client-side only)
```

This architecture satisfies GDPR Article 25 (Data Protection by Design) and the requirement that campus counselors cannot access individual student data without consent.
