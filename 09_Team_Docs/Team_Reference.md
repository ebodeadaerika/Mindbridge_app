# MindBridge — Team Quick Reference Card
## Print this and keep it at your desk

---

## Project Info
- Course: SEN3244 — Software Architecture
- Instructor: Engr. TEKOH PALMA
- Deadline: 1st Week after Spring Written Exams 2026
- Late penalty: 60% of score

---

## Your Role
| Member | Scrum Role | Owns |
|---|---|---|
| Member 1 | Product Owner | Auth endpoints, Mood Check-in, PyTest tests, coverage report |
| Member 2 | Scrum Master | Trello board, sprint docs, README, user manual, project report |
| Member 3 | Dev Lead | Journal, Forum, Crisis Flag, Resources, AI Companion |
| Member 4 | DevOps Lead | Docker, Jenkins, Kubernetes, Ansible, Prometheus, Grafana |

---

## GitHub Branch Strategy
- main → production (Jenkins deploys from here)
- dev → integration (merge PRs here first)
- feature/[name] → individual features

---

## Backend Build Order
1. Project Scaffold
2. Auth (register, login, JWT)
3. Mood Check-in
4. Journal
5. Forum
6. Crisis Flag
7. Resource Library
8. AI Companion

---

## Running the App Locally
```bash
# Start everything
docker compose up --build

# Backend API
http://localhost:8000

# Swagger UI (API docs)
http://localhost:8000/docs

# Frontend (when built)
npm run dev → http://localhost:5173
```

---

## Running Tests
```bash
# Run all tests with coverage
pytest --cov=app --cov-report=html --cov-report=term-missing

# Coverage must be >= 80% or Jenkins pipeline fails
```

---

## Marks That Need the Most Attention
1. Architecture doc (20 marks) — UML diagrams + trade-offs
2. Infrastructure (15 marks) — diagram + screenshots
3. Kubernetes (15 marks) — YAMLs + CLI output
4. Documentation (15 marks) — README + Swagger + report

---

## Don't Forget
- [ ] Burndown chart for Sprint 1
- [ ] Burndown chart for Sprint 2
- [ ] 80% test coverage
- [ ] 7-minute OBS video
- [ ] Max 20 PowerPoint slides
- [ ] Printed report following Chapter 1-4 template
- [ ] .ZIP with all files
- [ ] Submit on time (late = 60% penalty)

---

## Page Reference (Most Important Pages)
| Page | Screen | Built by |
|---|---|---|
| PAGE 4 | Student Dashboard | Member 3 |
| PAGE 10 | Crisis Support | Member 3 (SAFETY CRITICAL) |
| PAGE 11 | AI Companion | Member 3 |
| PAGE 14 | Admin Dashboard | Member 3 |

---

## API Base URL
Development: http://localhost:8000/api/v1
Production: https://[your-oracle-cloud-ip]/api/v1
Swagger: [base-url]/docs

---

## Environment Variables (.env)
```
DATABASE_URL=postgresql://user:password@db:5432/mindbridge
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
AI_API_KEY=your-claude-or-openai-key
AI_MODEL=claude-sonnet-4-20250514
```

---

## Key Privacy Rules (Never Break These)
1. MoodLog uses anon_token — NEVER user_id
2. Journal entries — NEVER returned to anyone except the owner
3. Forum posts — anonymous display name only, never linked to account
4. Crisis flags — identity never revealed in admin view
5. Database — NEVER exposed to public internet
