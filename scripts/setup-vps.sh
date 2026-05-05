#!/usr/bin/env bash
set -euo pipefail

DOMAIN="ready2cook.co.uk"
WWW_DOMAIN="www.ready2cook.co.uk"

sudo apt update
sudo apt install -y curl gnupg2 ca-certificates lsb-release software-properties-common

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

sudo apt install -y postgresql postgresql-contrib nginx certbot python3-certbot-nginx
sudo npm install -g pm2

sudo mkdir -p /var/www/ready2cook
sudo chown -R "$USER":"$USER" /var/www/ready2cook

cat <<EOF | sudo tee /etc/nginx/sites-available/ready2cook
server {
  listen 80;
  server_name ${DOMAIN} ${WWW_DOMAIN};

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_cache_bypass \$http_upgrade;
  }
}
EOF

sudo ln -sf /etc/nginx/sites-available/ready2cook /etc/nginx/sites-enabled/ready2cook
sudo nginx -t
sudo systemctl restart nginx

sudo certbot --nginx -d "${DOMAIN}" -d "${WWW_DOMAIN}" --non-interactive --agree-tos -m "admin@ready2cook.co.uk"

echo "VPS setup complete."
