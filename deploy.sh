#!/usr/bin/env bash
# 一键部署：本地 → VPS
# 用法：在项目根目录执行  ./deploy.sh
#   - rsync 同步代码（排除 node_modules / .git，--delete 保持云端与本地一致）
#   - package.json 有更新时才 npm install
#   - pm2 reload 重启（零停机，自动读取 ecosystem.config.js）
#   - 本机自检 127.0.0.1:3300
set -euo pipefail

VPS=root@43.155.165.57
KEY="$HOME/.ssh/id_rsa"
REMOTE_DIR=/www/wwwroot/shuzimima
APP=shuzimima
SSH_OPTS="-i $KEY -o BatchMode=yes -o StrictHostKeyChecking=accept-new"

[ -f package.json ] || { echo "请在项目根目录运行（找不到 package.json）"; exit 1; }

echo "▶ 1/3  同步代码 → $VPS:$REMOTE_DIR"
rsync -avz --delete \
  --exclude 'node_modules' --exclude '.git' --exclude '.DS_Store' \
  -e "ssh $SSH_OPTS" \
  ./ "$VPS:$REMOTE_DIR/" | tail -n 6

echo ""
echo "▶ 2/3  依赖（变了才装）+ 重启 PM2"
ssh $SSH_OPTS "$VPS" 'bash -s' <<'REMOTE'
source ~/.bashrc 2>/dev/null
set -e
cd /www/wwwroot/shuzimima
if [ ! -d node_modules ] || [ package.json -nt node_modules/.package-lock.json ]; then
  echo "  package.json 有更新 → npm install"
  npm install --no-audit --no-fund
else
  echo "  依赖无变化，跳过 npm install"
fi
pm2 reload ecosystem.config.js --update-env
echo "  pm2 reload ok"
REMOTE

echo ""
echo "▶ 3/3  本机自检"
sleep 1
ssh $SSH_OPTS "$VPS" 'curl -sI http://127.0.0.1:3300/ | head -1'

echo ""
echo "✓ 完成。刷新你的域名即可看到最新版。"
