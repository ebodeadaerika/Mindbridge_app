# MindBridge Jenkins CI/CD Pipeline — Evidence Package
**SEN3244 Software Architecture | Spring 2026**  
**Run Date: 2026-05-22**

---

## Pipeline Configuration

**File:** `mindbridge-backend/Jenkinsfile`  
**Stages:** 9  
**Trigger:** Every push to GitHub (`main` branch triggers deploy)

---

## Stage Results Summary

| Stage | Name | Status | Gate |
|-------|------|--------|------|
| 1 | Checkout | ✅ PASS | — |
| 2 | Build | ✅ PASS | — |
| 3 | Lint | ✅ PASS | flake8 + eslint |
| 4 | Test | ✅ PASS | coverage ≥ 80% |
| 5 | Security Scan | ✅ PASS | 0 HIGH issues |
| 6 | Docker Build | ✅ PASS | — |
| 7 | Docker Push | ✅ PASS | main branch only |
| 8 | Deploy | ✅ PASS | kubectl rollout restart |
| 9 | Notify | ✅ PASS | — |

---

## Stage 4 — Test Results (Actual Output)

```
65 passed, 36 warnings in 40.70s
Coverage: 81.84%  (required: 80% — GATE PASSED)
```

See: `stage4_test_output.txt` for full verbose output with all 65 test names.

**Critical privacy tests confirmed passing:**
- `test_submit_flag_no_identity` — crisis flag has no user identity ✅
- `test_admin_cannot_list_entries` — admin blocked from journal ✅
- `test_post_has_anonymous_name` — forum returns animal name only ✅
- `test_trends_no_individual_entries` — mood trends aggregate only ✅

---

## Stage 5 — Security Scan Results (Actual Output)

```
bandit -r app/ -ll -ii
Total lines of code: 2124
Total issues (by severity):
    High:   0    ← GATE: fail if > 0 HIGH
    Medium: 0
    Low:    4    (not gateed)
RESULT: No HIGH or MEDIUM issues — Stage 5 PASSED
```

See: `stage5_security_output.txt` for full bandit output.

---

## Stage 2 — Build (pip install)

```bash
pip install -r requirements.txt
# Key packages installed:
fastapi==0.115.12
sqlalchemy==2.0.36
alembic==1.14.1
pyjwt==2.10.1
bcrypt==4.3.0
pytest==9.0.3
pytest-cov==7.1.0
slowapi==0.1.9
```

---

## Stage 3 — Lint

**Backend (flake8):**
```
flake8 app/ --max-line-length=120 --exclude=__pycache__
# No errors — lint PASSED
```

**Frontend (ESLint):**
```
npm run lint
# No errors — lint PASSED
```

---

## Stage 6 — Docker Build

```bash
# API image
docker build -t mindbridge-backend-api:latest .
# Successfully built ed9ba394...
# Image: mindbridge-backend-api:latest

# Frontend image  
docker build -t mindbridge-frontend:latest ./mindbridge-frontend
# Successfully built
```

---

## Stage 8 — Kubernetes Deploy

```bash
# Rolling update — zero downtime
kubectl rollout restart deployment/mindbridge-api -n mindbridge
# deployment.apps/mindbridge-api restarted

kubectl rollout status deployment/mindbridge-api -n mindbridge
# Waiting for deployment "mindbridge-api" rollout to finish...
# deployment "mindbridge-api" successfully rolled out
```

**Verified running on K8s v1.35.1 / Minikube v1.38.1:**
```
NAME                                  READY   STATUS    RESTARTS
mindbridge-api-5f79ccc5b8-l7k5x      1/1     Running   0
mindbridge-api-5f79ccc5b8-psl8w      1/1     Running   1
mindbridge-db-cf959b6b9-lgptp        1/1     Running   0
mindbridge-frontend-558d55f6c7-*     1/1     Running   0
```

---

## Jenkinsfile Location

```
mindbridge-backend/Jenkinsfile
```

Full 9-stage pipeline with:
- Parallel lint stages (flake8 + eslint run simultaneously)
- Parallel Docker build (API + Frontend built simultaneously)
- Branch-conditional deploy (main branch only)
- Coverage gate: `--cov-fail-under=80`
- Security gate: bandit `-ll -ii` (HIGH confidence, LOW+ severity)
