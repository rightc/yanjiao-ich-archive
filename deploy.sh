#!/usr/bin/env bash
set -euo pipefail

MSG="${1:-chore: update H5 archive}"

git add .
git commit -m "$MSG" || echo "No changes to commit"
git push origin master

echo "✅ 已推送。请到 GitHub 仓库 Settings → Pages 开启站点"
echo "🔗 https://rightc.github.io/yanjiao-ich-archive/"
echo "仓库：https://github.com/rightc/yanjiao-ich-archive"
