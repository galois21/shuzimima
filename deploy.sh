#!/usr/bin/env bash
# 一键部署：本地 → VPS
# 用法：bash deploy.sh（脚本会自动 cd 到自身所在目录）
#   服务器信息从同目录 .deploy.env 读取（该文件已 gitignore，不入库）
#   - rsync 同步代码（排除 node_modules / .git / .deploy.env，--delete 保持云端=本地）
#   - package.json 有更新时才 npm install
#   - pm2 reload 重启（零停机，自动读取 ecosystem.config.js）
#   - 本机自检 127.0.0.1:3300
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.deploy.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "✗ 找不到 $ENV_FILE"
  echo "  请复制 .deploy.env.example 为 .deploy.env 并填入服务器信息"
  exit 1
fi
# shellcheck disable=SC1090
source "$ENV_FILE"

: "${VPS:?VPS 未设置（见 .deploy.env）}"
: "${REMOTE_DIR:?REMOTE_DIR 未设置（见 .deploy.env）}"
: "${KEY:=$HOME/.ssh/id_rsa}"
SSH_OPTS="-i $KEY -o BatchMode=yes -o StrictHostKeyChecking=accept-new"

cd "$SCRIPT_DIR"
[ -f package.json ] || { echo "✗ 找不到 package.json，确认在项目根目录"; exit 1; }

echo "▶ 1/3  同步代码 → $VPS:$REMOTE_DIR"
rsync -avz --delete \
  --exclude 'node_modules' --exclude '.git' --exclude '.DS_Store' \
  --exclude '.deploy.env' \
  -e "ssh $SSH_OPTS" \
  ./ "$VPS:$REMOTE_DIR/" | tail -n 6

echo ""
echo "▶ 2/3  依赖（变了才装）+ 重启 PM2"
ssh $SSH_OPTS "$VPS" 'bash -s' <<REMOTE
source ~/.bashrc 2>/dev/null
set -e
cd $REMOTE_DIR
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
