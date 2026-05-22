# MindBridge — Scrum Application Report
**SEN3244 Software Architecture | Section 2 (5 marks)**  
**Sprint Duration:** 2 weeks per sprint | **Total Sprints:** 2

---

## Scrum Team

| Name | Matricule | Role | Responsibilities |
|------|-----------|------|-----------------|
| EBODE ADA ERIKA ALEXANDRA | ICTU20233909 | Team Leader / Product Owner / Scrum Master | Backlog management, sprint planning, FastAPI backend, authentication, testing |
| AJA CHELLA ASAMBA JR | ICTU20233787 | Developer (Full-Stack + DevOps) | React frontend, Docker, Kubernetes, Jenkins, Ansible, monitoring, documentation |

---

## Product Backlog (All User Stories)

| ID | User Story | Story Points | Sprint |
|----|-----------|:---:|:---:|
| US-01 | As a student, I want to register with my university email | 3 | 1 |
| US-02 | As a student, I want to log in and receive a JWT token | 2 | 1 |
| US-03 | As a student, I want to reset my password via email | 3 | 1 |
| US-04 | As a student, I want to submit a daily mood check-in | 5 | 1 |
| US-05 | As a student, I want to view my mood history with a chart | 3 | 1 |
| US-06 | As a student, I want to write private journal entries | 5 | 1 |
| US-07 | As a student, I want to read and edit my journal entries | 2 | 1 |
| US-08 | As a student, I want to post anonymously in the forum | 5 | 1 |
| US-09 | As a student, I want to reply to forum posts | 3 | 1 |
| US-10 | As a student, I want to submit an anonymous crisis flag | 5 | 1 |
| US-11 | As an admin, I want to view all crisis alerts | 3 | 2 |
| US-12 | As an admin, I want to resolve a crisis flag | 2 | 2 |
| US-13 | As an admin, I want to see anonymised campus mood trends | 5 | 2 |
| US-14 | As a student, I want to browse the resource library | 3 | 2 |
| US-15 | As an admin, I want to create and manage resources | 3 | 2 |
| US-16 | As a student, I want to chat with the AI companion | 8 | 2 |
| US-17 | As an admin, I want to moderate forum posts | 2 | 2 |
| US-18 | As a student, I want to sign in with Google SSO | 5 | 2 |
| US-19 | As a student, I want to update my profile | 2 | 2 |
| US-20 | As a team, we want automated CI/CD deployment | 8 | 2 |
| US-21 | As a team, we want the app deployed on Kubernetes | 8 | 2 |
| US-22 | As a team, we want Prometheus + Grafana monitoring | 5 | 2 |
| **Total** | | **93** | |

---

## Sprint 1 (Weeks 1–2)
**Goal:** Core authentication + student wellness features

### Sprint 1 Backlog

| Story | Points | Day Done | Status |
|-------|:------:|:--------:|:------:|
| US-01 Register | 3 | Day 2 | ✅ Done |
| US-02 Login + JWT | 2 | Day 3 | ✅ Done |
| US-03 Password reset | 3 | Day 5 | ✅ Done |
| US-04 Mood check-in | 5 | Day 7 | ✅ Done |
| US-05 Mood history | 3 | Day 8 | ✅ Done |
| US-06 Create journal | 5 | Day 9 | ✅ Done |
| US-07 Edit journal | 2 | Day 10 | ✅ Done |
| US-08 Create forum post | 5 | Day 11 | ✅ Done |
| US-09 Forum replies | 3 | Day 12 | ✅ Done |
| US-10 Crisis flag | 5 | Day 13 | ✅ Done |
| **Sprint 1 Total** | **36** | | **36 pts delivered** |

### Sprint 1 Burndown Chart

```
Story Points Remaining
40 |█
   |█
35 |█
   |  ■  ← Ideal burndown
30 |     █
   |       ■
25 |         █
   |           ■
20 |             █
   |               ■
15 |                 █
   |                   ■
10 |                     █
   |                       ■
 5 |                         █
   |                           ■
 0 +━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   D1 D2 D3 D4 D5 D6 D7 D8 D9 D10

█ = Actual remaining   ■ = Ideal remaining
```

| Day | Ideal Remaining | Actual Remaining | Variance |
|-----|:--------------:|:----------------:|:--------:|
| 0 (start) | 36 | 36 | 0 |
| 2 | 28.8 | 33 | +4.2 |
| 3 | 25.2 | 31 | +5.8 |
| 5 | 18.0 | 24 | +6.0 |
| 7 | 10.8 | 16 | +5.2 |
| 8 | 7.2 | 11 | +3.8 |
| 9 | 3.6 | 5 | +1.4 |
| 10 | 0 | 0 | 0 |

**Sprint 1 Result:** ✅ All 36 points delivered by Day 10. Slight early lag caught up by end of sprint.

---

## Sprint 2 (Weeks 3–4)
**Goal:** Admin features + AI companion + DevOps + Testing

### Sprint 2 Backlog

| Story | Points | Day Done | Status |
|-------|:------:|:--------:|:------:|
| US-11 Admin crisis alerts | 3 | Day 2 | ✅ Done |
| US-12 Resolve crisis flag | 2 | Day 2 | ✅ Done |
| US-13 Campus mood trends | 5 | Day 4 | ✅ Done |
| US-14 Resource library | 3 | Day 5 | ✅ Done |
| US-15 Admin manage resources | 3 | Day 5 | ✅ Done |
| US-17 Forum moderation | 2 | Day 5 | ✅ Done |
| US-19 Edit profile | 2 | Day 6 | ✅ Done |
| US-18 Google SSO | 5 | Day 7 | ✅ Done |
| US-16 AI MindBot | 8 | Day 8 | ✅ Done |
| US-22 Prometheus + Grafana | 5 | Day 9 | ✅ Done |
| US-21 Kubernetes deployment | 8 | Day 9 | ✅ Done |
| US-20 Jenkins CI/CD | 8 | Day 10 | ✅ Done |
| **Sprint 2 Total** | **54** | | **54 pts delivered** |

### Sprint 2 Burndown Chart

```
Story Points Remaining
60 |█
   |  ■
55 |   █
   |     ■
50 |       █
   |         ■
45 |           █
   |             ■
40 |               █
   |                 ■
35 |                   █
   |                     ■
30 |                       █
   |                         ■
25 |
   |
20 |
   |
15 |
   |
10 |
   |
 5 |
   |
 0 +━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   D1 D2 D3 D4 D5 D6 D7 D8 D9 D10

█ = Actual remaining   ■ = Ideal remaining
```

| Day | Ideal Remaining | Actual Remaining | Variance |
|-----|:--------------:|:----------------:|:--------:|
| 0 (start) | 54 | 54 | 0 |
| 2 | 43.2 | 49 | +5.8 |
| 4 | 32.4 | 41 | +8.6 |
| 5 | 27.0 | 30 | +3.0 |
| 6 | 21.6 | 28 | +6.4 |
| 7 | 16.2 | 23 | +6.8 |
| 8 | 10.8 | 15 | +4.2 |
| 9 | 5.4 | 7 | +1.6 |
| 10 | 0 | 0 | 0 |

**Sprint 2 Result:** ✅ All 54 points delivered by Day 10. Back-loaded sprint due to complex DevOps stories (K8s, Jenkins) taking longer than estimated. All stories completed.

---

## Sprint Ceremonies

### Daily Stand-up Template (15 min)
Each team member answered:
1. **What did I complete yesterday?**
2. **What will I complete today?**
3. **Any blockers?**

### Sprint Review (End of Sprint)
- Demo of working features to "Product Owner"
- Acceptance criteria verified for each story
- Velocity calculated

### Sprint Retrospective (End of Sprint)
**Sprint 1 Retrospective:**
- ✅ What went well: Authentication and DB setup faster than expected
- ⚠️ What to improve: Earlier integration testing needed; started testing too late
- 🔄 Action: Start writing tests alongside feature development in Sprint 2

**Sprint 2 Retrospective:**
- ✅ What went well: DevOps setup (Docker, K8s) went smoothly
- ✅ What went well: Test coverage exceeded 80% target (81.84%)
- ⚠️ What to improve: AI feature scope could have been better estimated
- 🔄 Action: Split large stories (>5 pts) in future sprints

---

## Velocity Summary

| Sprint | Committed | Delivered | Velocity |
|--------|:---------:|:---------:|:--------:|
| Sprint 1 | 36 | 36 | 36 |
| Sprint 2 | 54 | 54 | 54 |
| **Average** | | | **45** |

---

## Definition of Done

A user story is **Done** when:
- [ ] Backend endpoint implemented and returns correct status codes
- [ ] Frontend UI page/component implemented and connected to API
- [ ] Unit/integration tests written (contributing to 80% coverage target)
- [ ] Manually tested in the browser (mobile + desktop)
- [ ] Code reviewed by at least one other team member
- [ ] No open bugs related to this story
