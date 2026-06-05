# MindBridge — Live Deployment Evidence
**SEN3244 Software Architecture | AWS EC2 | June 2026**

---

## Server Details

| Property | Value |
|----------|-------|
| **Cloud Provider** | Amazon Web Services (AWS) Free Tier |
| **Instance Type** | t3.micro (2 vCPU, 1 GB RAM) |
| **OS** | Ubuntu 26.04 LTS |
| **Region** | eu-north-1 (Stockholm) |
| **Public IP** | 13.60.57.180 |
| **Instance ID** | i-0a07661485ec9d4ca |
| **Status** | Running — 3/3 checks passed |

---

## Live URLs

| Service | URL | Status |
|---------|-----|--------|
| API Swagger UI | http://13.60.57.180:8000/docs | ✅ Live |
| Health Check | http://13.60.57.180/health | ✅ `{"status":"healthy"}` |
| Prometheus | http://13.60.57.180:9090 | ✅ Live |
| Grafana Dashboard | http://13.60.57.180:3001 | ✅ Live |

---

## Deployment Method

**Tool:** Ansible (2 playbooks)  
**Orchestration:** Docker Compose (4 containers)  
**Reverse Proxy:** Nginx

### Playbook 1 — install_dependencies.yml
Installed on the VPS:
- Docker Engine 29.5.3
- Docker Compose plugin
- Nginx 1.28.3
- Python 3.14.4
- UFW Firewall (ports 22, 80, 443 open)

### Playbook 2 — deploy_app.yml
- Synced application code via rsync
- Deployed `.env` from Jinja2 template
- Built and started 4 Docker containers
- Ran Alembic database migrations
- Configured Nginx reverse proxy

---

## Running Containers

| Container | Image | Status | Port |
|-----------|-------|--------|------|
| mindbridge_api | mindbridge-api:latest | ✅ Up (healthy) | 8000 |
| mindbridge_db | postgres:15-alpine | ✅ Up (healthy) | 5432 (internal) |
| mindbridge_prometheus | prom/prometheus:v2.51.0 | ✅ Up | 9090 |
| mindbridge_grafana | grafana/grafana:10.4.0 | ✅ Up | 3001 |

---

## Monitoring Evidence

**Prometheus Targets:**
- `mindbridge-api (1/1 up)` — scraping http://api:8000/metrics every 15s
- `prometheus (1/1 up)` — self-monitoring

**Grafana Dashboard — MindBridge API Health:**
- Total Requests (5m): 30.5
- Error Rate (5xx): 0 (no errors)
- p95 Latency: 95ms
- Request Rate tracked by endpoint: /docs, /health, /metrics, /openapi.json

---

## Screenshots (save in this folder)
1. `01_aws_ec2_instance.png` — EC2 instance running on AWS
2. `02_aws_security_groups.png` — Firewall rules (ports 22, 80, 8000, 9090, 3001)
3. `03_swagger_ui.png` — MindBridge API documentation
4. `04_health_check.png` — Health endpoint returning `{"status":"healthy"}`
5. `05_prometheus_targets.png` — Prometheus scraping MindBridge API
6. `06_grafana_dashboard.png` — Live API metrics dashboard

---

## Ansible Run Summary

**Playbook 1 Result:** `ok=24 changed=0 unreachable=0 failed=0`  
**Playbook 2 Result:** Deployed successfully, all containers healthy

*Deployed by: AJA CHELLA ASAMBA JR (ICTU20233787)*  
*Team Leader: EBODE ADA ERIKA ALEXANDRA (ICTU20233909)*
