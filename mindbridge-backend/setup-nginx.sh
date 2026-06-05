#!/bin/bash
# MindBridge — Nginx setup script for EC2

cat > /etc/nginx/sites-available/mindbridge << 'EOF'
server {
    listen 80;
    server_name _;

    location ~ ^/(api|docs|redoc|openapi.json|health|metrics) {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 60s;
    }

    location /grafana/ {
        proxy_pass http://127.0.0.1:3001/;
        proxy_set_header Host $host;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

ln -sf /etc/nginx/sites-available/mindbridge /etc/nginx/sites-enabled/mindbridge
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx
echo "Nginx configured successfully!"
