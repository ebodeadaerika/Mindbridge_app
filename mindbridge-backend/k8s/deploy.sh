#!/usr/bin/env bash
# ── MindBridge — Minikube Deployment Script ───────────────────────────────────
# Builds images, pushes to Minikube's Docker daemon, and applies all manifests.
# Usage: bash k8s/deploy.sh
# Prerequisites: minikube, docker, kubectl

set -euo pipefail

BACKEND_DIR="$(cd "$(dirname "$0")/.." && pwd)"
FRONTEND_DIR="$(cd "$(dirname "$0")/../../mindbridge-frontend" && pwd)"
K8S_DIR="$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   MindBridge — Kubernetes Deployment     ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── Step 1: Start Minikube ────────────────────────────────────────────────────
echo "▶ [1/7] Starting Minikube..."
if ! minikube status &>/dev/null; then
  minikube start --driver=docker --cpus=2 --memory=4096 --disk-size=20g
else
  echo "  Minikube already running ✓"
fi

# ── Step 2: Enable Ingress addon ──────────────────────────────────────────────
echo "▶ [2/7] Enabling Ingress addon..."
minikube addons enable ingress
minikube addons enable metrics-server  # needed for HPA

# ── Step 3: Point Docker CLI to Minikube's daemon ────────────────────────────
echo "▶ [3/7] Configuring Docker to use Minikube's registry..."
eval "$(minikube docker-env)"

# ── Step 4: Build images inside Minikube ─────────────────────────────────────
echo "▶ [4/7] Building backend image..."
docker build -t yourdockerhubuser/mindbridge-api:latest "$BACKEND_DIR"

echo "▶ [4/7] Building frontend image..."
docker build -t yourdockerhubuser/mindbridge-frontend:latest "$FRONTEND_DIR"

# ── Step 5: Apply namespace first ────────────────────────────────────────────
echo "▶ [5/7] Creating namespace..."
kubectl apply -f "$K8S_DIR/namespace.yaml"

# ── Step 6: Apply all manifests ───────────────────────────────────────────────
echo "▶ [6/7] Applying Kubernetes manifests..."
kubectl apply -f "$K8S_DIR/pvc.yaml"
kubectl apply -f "$K8S_DIR/ingress.yaml"     # ConfigMap + Secrets
kubectl apply -f "$K8S_DIR/service.yaml"     # PostgreSQL deployment + services
kubectl apply -f "$K8S_DIR/deployment.yaml"  # API deployment
kubectl apply -f "$K8S_DIR/frontend.yaml"    # Frontend deployment + service
kubectl apply -f "$K8S_DIR/hpa.yaml"         # Horizontal Pod Autoscaler
kubectl apply -f "$K8S_DIR/networkpolicy.yaml"

# ── Step 7: Wait for rollout ──────────────────────────────────────────────────
echo "▶ [7/7] Waiting for deployments to be ready..."
kubectl rollout status deployment/mindbridge-db -n mindbridge --timeout=120s
kubectl rollout status deployment/mindbridge-api -n mindbridge --timeout=120s
kubectl rollout status deployment/mindbridge-frontend -n mindbridge --timeout=120s

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════╗"
echo "║         Deployment Complete! ✅           ║"
echo "╚══════════════════════════════════════════╝"
echo ""

MINIKUBE_IP=$(minikube ip)
echo "  Minikube IP : $MINIKUBE_IP"
echo "  Add to /etc/hosts: $MINIKUBE_IP  mindbridge.local"
echo ""
echo "  App URL     : http://mindbridge.local"
echo "  API Docs    : http://mindbridge.local/docs"
echo "  Health      : http://mindbridge.local/health"
echo ""

echo "── Pod Status ───────────────────────────────"
kubectl get pods -n mindbridge
echo ""
echo "── Services ─────────────────────────────────"
kubectl get svc -n mindbridge
echo ""
echo "── HPA ──────────────────────────────────────"
kubectl get hpa -n mindbridge
echo ""

echo "Tip: Run 'minikube dashboard' to open the K8s dashboard"
