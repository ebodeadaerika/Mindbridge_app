#!/usr/bin/env bash
# ── MindBridge — One-Command VPS Deployment ───────────────────────────────────
# Usage: bash ansible/deploy.sh
# Requires: ansible installed locally, VPS IP set in inventory/hosts.ini
#           AI_API_KEY set in ansible/vars/production.yml

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INVENTORY="$SCRIPT_DIR/inventory/hosts.ini"

echo "======================================================"
echo "  MindBridge — Production Deployment"
echo "  Target: $(grep ansible_host $INVENTORY | awk -F= '{print $2}' | awk '{print $1}')"
echo "======================================================"

echo ""
echo "► Step 1/2: Install server dependencies (Docker, Nginx, UFW)..."
ansible-playbook -i "$INVENTORY" "$SCRIPT_DIR/playbooks/install_dependencies.yml"

echo ""
echo "► Step 2/2: Deploy application (sync code, .env, docker compose up)..."
ansible-playbook -i "$INVENTORY" "$SCRIPT_DIR/playbooks/deploy_app.yml"

echo ""
echo "======================================================"
echo "  Deployment complete!"
echo "======================================================"
